/**
 * @name BetterRichPresence
 * @version 1.0.0
 * @description Simple Last.fm Rich Presence for Discord
 * @author vista747
 * @source https://julius.cool/better-rich-presence
 */

class Constants {
  static getClientID() { return '1052565934088405062'; }
  static getDefaultSettings() {
    return {
      lastFMKey: '',
      lastFMNickname: '',
      disableWhenSpotify: true,
      disableWhenActivity: false,
      listeningTo: true,           
      lastfmButton: true,          
      assetIcon: true,             
    };
  }
  static getUpdateInterval() { return 20000; }
  static getMissing() { return 'Paste your Last.fm API key and username in settings.'; }
}

class AssetManager {
  static _instance = null;
  static getFromAssetManger() {
    if (!AssetManager._instance) {
      const filter = BdApi.Webpack.Filters.byStrings('getAssetImage: size must === [number, number] for Twitch');
      const assetManager = BdApi.Webpack.getModule(m => typeof m === 'object' && Object.values(m).some(filter));
      for (const key in assetManager) {
        const member = assetManager[key];
        if (typeof member === 'function' && member.toString().includes('APPLICATION_ASSETS_FETCH')) {
          AssetManager._instance = member; break;
        }
      }
    }
    return AssetManager._instance;
  }
  static async getAsset(key) { return (await AssetManager.getFromAssetManger()(Constants.getClientID(), [key, undefined]))[0]; }
}

class SettingsManager {
  static getSettings() { return BdApi.loadData('LastFMRichPresence', 'settings') || {}; }
  static updateSettings(settings) { BdApi.saveData('LastFMRichPresence', 'settings', settings); }
  static initialize() {
    const s = SettingsManager.getSettings();
    const def = Constants.getDefaultSettings();
    for (const k of Object.keys(def)) if (typeof s[k] === 'undefined') s[k] = def[k];
    SettingsManager.updateSettings(s);
  }
}

class RPCManager {
  static _instance = null;
  static getRPC() {
    if (!RPCManager._instance) RPCManager._instance = BdApi.findModuleByProps('dispatch','_subscriptions');
    return RPCManager._instance;
  }
  static setActivity(activity) {
    if (activity) {
      activity = { ...activity, flags: 1, type: SettingsManager.getSettings().listeningTo ? 2 : 0 };
    }
    RPCManager.getRPC().dispatch({ type: 'LOCAL_ACTIVITY_UPDATE', activity });
  }
}

class Requests {
  static async getCurrentScrobble(username, apiKey) {
    const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${encodeURIComponent(apiKey)}&format=json&limit=1`, { headers: { 'cache-control': 'no-cache' } });
    if (!res.ok) throw new Error('HTTP '+res.status);
    return res.json();
  }
}

class Utilities {
  static isURL(u){ try{ new URL(u); return true;}catch{ return false; } }
}

class LastFMRichPresence {
  constructor(){
    this.settings = SettingsManager.getSettings();
    this.trackData = {};
    this.paused = false;
    this.startPlaying = Date.now();
    this.timer = 0;
    this.getLocalPresence = BdApi.findModuleByProps('getLocalPresence').getLocalPresence;
  }

  getName(){ return 'LastFMRichPresence'; }
  getDescription(){ return 'Simple Last.fm Rich Presence. Shows artist / track as your Discord activity.'; }
  getVersion(){ return '1.1.0-simplified'; }
  getAuthor(){ return 'Julius/ChatGPT'; }

  start(){
    SettingsManager.initialize();
    this.settings = SettingsManager.getSettings();
    if (!this.settings.lastFMKey || !this.settings.lastFMNickname){ BdApi.showToast(Constants.getMissing()); return; }
    this.timer = setInterval(()=>this.tick(), Constants.getUpdateInterval());
    this.tick();
  }

  stop(){ clearInterval(this.timer); this.timer=0; this.pause(); }
  pause(){ if (this.paused) return; this.paused = true; RPCManager.setActivity({}); }
  resume(){ this.paused = false; }

  async tick(){
    const s = this.settings = SettingsManager.getSettings();

    const activities = this.getLocalPresence().activities;
    if (s.disableWhenSpotify && activities.find(a=>a.name==='Spotify')){ if (activities.find(a=>a.application_id===Constants.getClientID())) RPCManager.setActivity({}); return; }
    if (s.disableWhenActivity && activities.some(a=>a.application_id!==Constants.getClientID())){ if (activities.find(a=>a.application_id===Constants.getClientID())) RPCManager.setActivity({}); return; }

    let data;
    try{ data = await Requests.getCurrentScrobble(s.lastFMNickname, s.lastFMKey); }
    catch(e){ console.error('[LastFMRP] fetch failed', e); return; }

    const track = data?.recenttracks?.track?.[0];
    if (!track) { this.pause(); return; }

    if (track['@attr']?.nowplaying){
      if (track.name !== this.trackData.name){ this.startPlaying = Date.now(); this.resume(); }
      this.trackData = track;
      this.updatePresence();
    } else { this.trackData = {}; this.pause(); }
  }

  async updatePresence(){
    if (this.paused || !this.trackData) return;
    const s = this.settings;

    const activity = {
      application_id: Constants.getClientID(),
      details: this.trackData.name,
      buttons: undefined,
      metadata: undefined,
    };

    if (this.trackData?.album?.['#text']){
      const album = this.trackData.album['#text'];
      const artist = this.trackData?.artist?.['#text'];
      activity.state = artist ? `${artist} — ${album}` : album;
    } else if (this.trackData?.artist?.['#text']){
      activity.state = this.trackData.artist['#text'];
    }

    activity.timestamps = { start: this.startPlaying || Date.now() };

    activity.assets = {};
    if (s.assetIcon){
      activity.assets.small_image = await AssetManager.getAsset('lastfm');
      activity.assets.small_text = 'Last.fm';
    }

    const cover = this.trackData?.image?.[1]?.['#text'];
    if (cover){ activity.assets.large_image = await AssetManager.getAsset(cover); }

    const trackUrl = this.trackData?.url;
    if (s.lastfmButton && Utilities.isURL(trackUrl)){
      activity.buttons = ['Open on Last.fm'];
      activity.metadata = { button_urls: [trackUrl] };
    }

    RPCManager.setActivity(activity);
  }

  getSettingsPanel(){
    const tpl = document.createElement('template');
    tpl.innerHTML = `
    <div style="color: var(--header-primary); font-size: 14px; line-height: 1.6; max-width: 560px; margin-top: 16px;">
      <b>Last.fm API key</b><br>
      <input class="lastfmkey inputDefault-Ciwd-S input-3O04eu" placeholder="last.fm key" style="width:80%">
      <br><br>
      <b>Last.fm username</b><br>
      <input class="lastfmnick inputDefault-Ciwd-S input-3O04eu" placeholder="username" style="width:80%">
      <br><br>
      <b>Show as "Listening to"</b>
      <select class="listeningto inputDefault-Ciwd-S input-3O04eu" style="width:80%">
        <option value="true">ON</option>
        <option value="false">OFF</option>
      </select>
      <br><br>
      <b>Disable when Spotify active</b>
      <select class="dws inputDefault-Ciwd-S input-3O04eu" style="width:80%">
        <option value="true">ON</option>
        <option value="false">OFF</option>
      </select>
      <br><br>
      <b>Disable when other activity detected</b>
      <select class="dwa inputDefault-Ciwd-S input-3O04eu" style="width:80%">
        <option value="false">OFF</option>
        <option value="true">ON</option>
      </select>
      <br><br>
      <b>Show Last.fm button</b>
      <select class="lfmbtn inputDefault-Ciwd-S input-3O04eu" style="width:80%">
        <option value="true">ON</option>
        <option value="false">OFF</option>
      </select>
      <br><br>
      <b>Show small Last.fm icon</b>
      <select class="asset inputDefault-Ciwd-S input-3O04eu" style="width:80%">
        <option value="true">ON</option>
        <option value="false">OFF</option>
      </select>
    </div>`;

    const root = tpl.content.firstElementChild;
    const s = this.settings = SettingsManager.getSettings();

    const keyEl = root.querySelector('.lastfmkey');
    const nickEl = root.querySelector('.lastfmnick');
    const listeningEl = root.querySelector('.listeningto');
    const dwsEl = root.querySelector('.dws');
    const dwaEl = root.querySelector('.dwa');
    const lbtnEl = root.querySelector('.lfmbtn');
    const assetEl = root.querySelector('.asset');

    keyEl.value = s.lastFMKey || '';
    nickEl.value = s.lastFMNickname || '';
    listeningEl.value = s.listeningTo ? 'true' : 'false';
    dwsEl.value = s.disableWhenSpotify ? 'true' : 'false';
    dwaEl.value = s.disableWhenActivity ? 'true' : 'false';
    lbtnEl.value = s.lastfmButton ? 'true' : 'false';
    assetEl.value = s.assetIcon ? 'true' : 'false';

    const save = () => SettingsManager.updateSettings(this.settings);

    keyEl.oninput = ()=>{ this.settings.lastFMKey = keyEl.value; save(); };
    nickEl.oninput = ()=>{ this.settings.lastFMNickname = nickEl.value; save(); };
    listeningEl.onchange = ()=>{ this.settings.listeningTo = listeningEl.value==='true'; save(); };
    dwsEl.onchange = ()=>{ this.settings.disableWhenSpotify = dwsEl.value==='true'; save(); };
    dwaEl.onchange = ()=>{ this.settings.disableWhenActivity = dwaEl.value==='true'; save(); };
    lbtnEl.onchange = ()=>{ this.settings.lastfmButton = lbtnEl.value==='true'; save(); };
    assetEl.onchange = ()=>{ this.settings.assetIcon = assetEl.value==='true'; save(); };

    return root;
  }
}

module.exports = LastFMRichPresence;
