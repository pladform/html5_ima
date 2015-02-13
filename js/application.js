
var Application = function() {
  //this.adTagBox_ = document.getElementById('tagText');
  //this.adTagBox_.value = this.SAMPLE_AD_TAG_;
  //this.sampleAdTag_ = document.getElementById('sampleAdTag');
  /*this.sampleAdTag_.addEventListener(
      'click',
      this.bind_(this, this.onSampleAdTagClick_),
      false);*/
  this.console_ = document.getElementById('console');
  this.playButton_ = document.getElementById('playpause');
  this.playButton_.addEventListener(
      'click',
      this.bind_(this, this.onClick_),
      false);
  this.fullscreenButton_ = document.getElementById('fullscreen');
  this.fullscreenButton_.addEventListener(
      'click',
      this.bind_(this, this.onFullscreenClick_),
      false);

  this.fullscreenWidth = null;
  this.fullscreenHeight = null;

  var fullScreenEvents = [
      'fullscreenchange',
      'mozfullscreenchange',
      'webkitfullscreenchange'];
  for (key in fullScreenEvents) {
    document.addEventListener(
        fullScreenEvents[key],
        this.bind_(this, this.onFullscreenChange_),
        false);
  }


  this.playing_ = false;
  this.adsActive_ = false;
  this.adsDone_ = false;
  this.fullscreen = false;
  
  this.simpleVast_ = null;

  this.videoPlayer_ = new VideoPlayer();
  this.ads_ = new Ads(this, this.videoPlayer_);
  this.adTagUrl_ = '';
  this.setSimpleVast();

  this.videoPlayer_.registerVideoEndedCallback(
      this.bind_(this, this.onContentEnded_));
};

/*Application.prototype.SAMPLE_AD_TAG_ = 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x360' +
'&iu=/6062/iab_vast_samples/skippable&ciu_szs=300x250,728x90&impl=s' +
'&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1' +
'&url=[referrer_url]&correlator=[timestamp]';*/
//Application.prototype.SAMPLE_AD_TAG = 'http://ad3.liverail.com/?LR_PUBLISHER_ID=1331&LR_CAMPAIGN_ID=229&LR_SCHEMA=vast2';
//Application.prototype.SAMPLE_AD_TAG_ = 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x360&iu=/6062/iab_vast_samples/skippable&ciu_szs=300x250,728x90&impl=s&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&url=[referrer_url]&correlator=[timestamp]';
//Application.prototype.SAMPLE_AD_TAG_ = 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=%2F3510761%2FadRulesSampleTags&ciu_szs=160x600%2C300x250%2C728x90&cust_params=adrule%3Dpremidpostwithpod&impl=s&gdfp_req=1&env=vp&ad_rule=1&vid=47570401&cmsid=481&output=xml_vast2&unviewed_position_start=1&url=[referrer_url]&correlator=[timestamp';
Application.prototype.SAMPLE_AD_TAG_ = 'http://cdn.test.pladform.ru/xml/ads.xml';

//Application.prototype.SAMPLE_AD_TAG_ = 'http://test.loc';

Application.prototype.log = function(message) {
  this.console_.innerHTML = this.console_.innerHTML + '<br/>' + message;
  this.console_.scrollTop = this.console_.scrollHeight;
};

Application.prototype.resumeAfterAd = function() {
  this.videoPlayer_.play();
  this.adsActive_ = false;
  this.updateChrome_();
};

Application.prototype.pauseForAd = function() {
  this.adsActive_ = true;
  this.playing_ = true;
  this.videoPlayer_.pause();
  this.updateChrome_();
};

Application.prototype.adClicked = function() {
  this.updateChrome_();
};

Application.prototype.bind_ = function(thisObj, fn) {
  return function() {
    fn.apply(thisObj, arguments);
  };
};

Application.prototype.onSampleAdTagClick_ = function() {
  this.adTagBox_.value = this.SAMPLE_AD_TAG_;
};

Application.prototype.onClick_ = function() {

  if (!this.adsDone_) {
	
	if (this.SAMPLE_AD_TAG_ == '') {
		this.log('Error: please fill DEFAULT_AD_TAG_');
		return;
	} else {
		this.adTagUrl_ = this.SAMPLE_AD_TAG_;
	}
    // The user clicked/tapped - inform the ads controller that this code
    // is being run in a user action thread.
    this.ads_.initialUserAction();
    // At the same time, initialize the content player as well.
    // When content is loaded, we'll issue the ad request to prevent it
    // from interfering with the initialization. See
    // https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/ads#iosvideo
    // for more information.
    this.videoPlayer_.preloadContent(this.bind_(this, this.loadAds_));
    this.adsDone_ = true;
    return;
  }

  if (this.adsActive_) {
    if (this.playing_) {
      this.ads_.pause();
    } else {
      this.ads_.resume();
    }
  } else {
    if (this.playing_) {
      this.videoPlayer_.pause();
    } else {
      this.videoPlayer_.play();
    }
  }

  this.playing_ = !this.playing_;

  this.updateChrome_();
};

Application.prototype.onFullscreenClick_ = function() {
  if (this.fullscreen) {
    // The video is currently in fullscreen mode
    var cancelFullscreen = document.exitFullscreen ||
        document.exitFullScreen ||
        document.webkitCancelFullScreen ||
        document.mozCancelFullScreen;
    if (cancelFullscreen) {
      cancelFullscreen.call(document);
    } else {
      this.onFullscreenChange_();
    }
  } else {
    // Try to enter fullscreen mode in the browser
    var requestFullscreen = document.documentElement.requestFullscreen ||
        document.documentElement.webkitRequestFullscreen ||
        document.documentElement.mozRequestFullscreen ||
        document.documentElement.requestFullScreen ||
        document.documentElement.webkitRequestFullScreen ||
        document.documentElement.mozRequestFullScreen;
    if (requestFullscreen) {
      this.fullscreenWidth = window.screen.width;
      this.fullscreenHeight = window.screen.height;
      requestFullscreen.call(document.documentElement);
    } else {
      this.fullscreenWidth = window.innerWidth;
      this.fullscreenHeight = window.innerHeight;
      this.onFullscreenChange_();
    }
  }
  
  //requestFullscreen.call(document.documentElement);
  
};

Application.prototype.updateChrome_ = function() {
  if (this.playing_) {
    this.playButton_.textContent = 'II';
  } else {
    // Unicode play symbol.
    this.playButton_.textContent = String.fromCharCode(9654);
  }
};

Application.prototype.loadAds_ = function() {
  this.ads_.requestAds(this.adTagUrl_);
};

Application.prototype.onFullscreenChange_ = function() {
  if (this.fullscreen) {
    // The user just exited fullscreen
    // Resize the ad container
    this.ads_.resize(
        this.videoPlayer_.width,
        this.videoPlayer_.height);
    // Return the video to its original size and position
    this.videoPlayer_.resize(
        'relative',
        '',
        '',
        this.videoPlayer_.width,
        this.videoPlayer_.height);
    this.videoPlayer_.setClassName('');
    this.fullscreen = false;
  } else {
    // The fullscreen button was just clicked
    // Resize the ad container
    var width = this.fullscreenWidth;
    var height = this.fullscreenHeight;
    this.makeAdsFullscreen_();
    // Make the video take up the entire screen
    this.videoPlayer_.resize('absolute', 0, 0, width, height);
    this.videoPlayer_.setClassName('fullscreen');
    this.fullscreen = true;
  }
  
  this.videoPlayer_.updateVolumeDisplay();
  
};

Application.prototype.makeAdsFullscreen_ = function() {
  this.ads_.resize(
      this.fullscreenWidth,
      this.fullscreenHeight);
};

Application.prototype.onContentEnded_ = function() {
  this.ads_.contentEnded();
};

Application.prototype.setSimpleVast = function(vastString){
	//this.simpleVast_ = vastString.toString();
	this.simpleVast_ = '<Playlist><Preroll><Ad><![CDATA[http://ad3.liverail.com/?LR_PUBLISHER_ID=1331&LR_CAMPAIGN_ID=229&LR_SCHEMA=vast2]]></Ad></Preroll></Playlist>';
/*'<Midroll timeOffset="00:00:30">'+
'<Ad>'+
'<![CDATA[http://pubads.g.doubleclick.net/gampad/ads?slotname=/3510761/adRulesSampleTags&sz=640x480&ciu_szs=160x600,300x250,728x90&cust_params=adrule%3Dpremidpostwithpod&url=%5Breferrer_url%5D&unviewed_position_start=1&output=xml_vast2&impl=s&env=vp&gdfp_req=1&ad_rule=0&vad_type=linear&vpos=midroll&pod=2&mridx=1&min_ad_duration=0&max_ad_duration=30000&ppos=1&video_doc_id=47570401&cmsid=481]]></Ad>'+
'</Midroll>'+
'<Midroll timeOffset="00:01:00">'+
'<Ad>'+
'<![CDATA[http://pubads.g.doubleclick.net/gampad/ads?slotname=/3510761/adRulesSampleTags&sz=640x480&ciu_szs=160x600,300x250,728x90&cust_params=adrule%3Dpremidpostwithpod&url=%5Breferrer_url%5D&unviewed_position_start=1&output=xml_vast2&impl=s&env=vp&gdfp_req=1&ad_rule=0&vad_type=linear&vpos=midroll&pod=3&mridx=2&min_ad_duration=0&max_ad_duration=30000&ppos=1&video_doc_id=47570401&cmsid=481]]></Ad>'+
'</Midroll>'+
'<Midroll timeOffset="00:01:30">'+
'<Ad>'+
'<![CDATA[http://pubads.g.doubleclick.net/gampad/ads?slotname=/3510761/adRulesSampleTags&sz=640x480&ciu_szs=160x600,300x250,728x90&cust_params=adrule%3Dpremidpostwithpod&url=%5Breferrer_url%5D&unviewed_position_start=1&output=xml_vast2&impl=s&env=vp&gdfp_req=1&ad_rule=0&vad_type=linear&vpos=midroll&pod=4&mridx=3&min_ad_duration=0&max_ad_duration=30000&ppos=1&video_doc_id=47570401&cmsid=481]]></Ad>'+
'</Midroll>'+
'<Postroll>'+
'<Ad>'+
'<![CDATA[http://pubads.g.doubleclick.net/gampad/ads?slotname=/3510761/adRulesSampleTags&sz=640x480&ciu_szs=160x600,300x250,728x90&cust_params=adrule%3Dpremidpostwithpod&url=%5Breferrer_url%5D&unviewed_position_start=1&output=xml_vast2&impl=s&env=vp&gdfp_req=1&ad_rule=0&vad_type=linear&vpos=postroll&pod=5&min_ad_duration=0&max_ad_duration=30000&ppos=1&lip=true&video_doc_id=47570401&cmsid=481]]></Ad>'+
'</Postroll>'+*/

};

Application.prototype.getSimpleVast = function(){
	return this.simpleVast_;
};
