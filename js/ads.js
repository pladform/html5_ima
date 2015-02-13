var Ads = function(application, videoPlayer) {
  this.application_ = application;
  this.videoPlayer_ = videoPlayer;
  this.contentCompleteCalled_ = false;
  // Call setLocale() to localize language text and downloaded swfs
  // google.ima.settings.setLocale('fr');
  this.adDisplayContainer_ =
      new google.ima.AdDisplayContainer(this.videoPlayer_.adContainer);
  this.adsLoader_ = new google.ima.AdsLoader(this.adDisplayContainer_);
  this.adsManager_ = null;

  this.adsLoader_.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      this.onAdsManagerLoaded_,
      false,
      this);
  this.adsLoader_.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      this.onAdError_,
      false,
      this);
};

// On iOS and Android devices, video playback must begin in a user action.
// AdDisplayContainer provides a initialize() API to be called at appropriate
// time.
// This should be called when the user clicks or taps.
Ads.prototype.initialUserAction = function() {
  this.adDisplayContainer_.initialize();
};

Ads.prototype.requestAds = function(adTagUrl) {
  var adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = adTagUrl;
  //adsRequest.adsResponse = this.application_.getSimpleVast();
  
  adsRequest.linearAdSlotWidth = this.videoPlayer_.width;
  adsRequest.linearAdSlotHeight = this.videoPlayer_.height;
  adsRequest.nonLinearAdSlotWidth = this.videoPlayer_.width;
  adsRequest.nonLinearAdSlotHeight = this.videoPlayer_.height;
  this.adsLoader_.requestAds(adsRequest);
};

Ads.prototype.pause = function() {
  if (this.adsManager_) {
    this.adsManager_.pause();
  }
};

Ads.prototype.resume = function() {
  if (this.adsManager_) {
    this.adsManager_.resume();
  }
};

Ads.prototype.resize = function(width, height) {
  if (this.adsManager_) {
    this.adsManager_.resize(width, height, google.ima.ViewMode.FULLSCREEN);
  }
};

Ads.prototype.contentEnded = function() {
  this.contentCompleteCalled_ = true;
  this.adsLoader_.contentComplete();
};

Ads.prototype.onAdsManagerLoaded_ = function(adsManagerLoadedEvent) {
  this.application_.log('Ads loaded.');
  this.adsManager_ = adsManagerLoadedEvent.getAdsManager(
      this.videoPlayer_.contentPlayer);
  this.processAdsManager_(this.adsManager_);
};

Ads.prototype.processAdsManager_ = function(adsManager) {
  // Attach the pause/resume events.
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      this.onContentPauseRequested_,
      false,
      this);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      this.onContentResumeRequested_,
      false,
      this);
  // Handle errors.
  adsManager.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      this.onAdError_,
      false,
      this);
  var events = [google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
                google.ima.AdEvent.Type.CLICK,
                google.ima.AdEvent.Type.COMPLETE,
                google.ima.AdEvent.Type.FIRST_QUARTILE,
                google.ima.AdEvent.Type.LOADED,
                google.ima.AdEvent.Type.MIDPOINT,
                google.ima.AdEvent.Type.PAUSED,
                google.ima.AdEvent.Type.STARTED,
                google.ima.AdEvent.Type.THIRD_QUARTILE];
  for (var index in events) {
    adsManager.addEventListener(
        events[index],
        this.onAdEvent_,
        false,
        this);
  }

  var initWidth, initHeight;
  if (this.application_.fullscreen) {
    initWidth = this.application_.fullscreenWidth;
    initHeight = this.application_.fullscreenHeight;
  } else {
    initWidth = this.videoPlayer_.width;
    initHeight = this.videoPlayer_.height;
  }
  adsManager.init(
    initWidth,
    initHeight,
    google.ima.ViewMode.NORMAL);

  adsManager.start();
};

Ads.prototype.onContentPauseRequested_ = function(adErrorEvent) {
  this.application_.pauseForAd();
};

Ads.prototype.onContentResumeRequested_ = function(adErrorEvent) {
  // Without this check the video starts over from the beginning on a
  // post-roll's CONTENT_RESUME_REQUESTED
  if (!this.contentCompleteCalled_) {
    this.application_.resumeAfterAd();
  }
};

Ads.prototype.onAdEvent_ = function(adEvent) {
	var ad = adEvent.getAd();
	this.application_.log('Ad событие: ' + adEvent.type);
	var self_ = this;

	if (adEvent.type == google.ima.AdEvent.Type.CLICK) {
		this.application_.adClicked();
	}
  
	switch(adEvent.type) {
  		case google.ima.AdEvent.Type.STARTED:
  			if (ad.isLinear()) {
  				intervalTimer = setInterval(function(){
  					self_.videoPlayer_.setRemainingTime(self_.adsManager_.getRemainingTime());
  				}, 300);
  			}
  			self_.videoPlayer_.hideControlls();
  			break;
  		case google.ima.AdEvent.Type.COMPLETE:
  			if (ad.isLinear()) {
  				clearInterval(intervalTimer);
  				self_.videoPlayer_.clearRemainingBlock();
  			}
  			self_.videoPlayer_.showControlls();
  			break;
	}
  
};

Ads.prototype.onAdError_ = function(adErrorEvent) {
  this.application_.log('Ad error: ' + adErrorEvent.getError().toString());
  if (this.adsManager_) {
    this.adsManager_.destroy();
  }
  this.application_.resumeAfterAd();
};
