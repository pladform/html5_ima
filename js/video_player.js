
var VideoPlayer = function() {
  this.contentPlayer = document.getElementById('content');
  this.adContainer = document.getElementById('adcontainer');
  this.adRemainingBlock = document.getElementById('adTimeRemaining');
  this.videoPlayerContainer_ = document.getElementById('videoplayer');
  this.volumeContainer_ = document.getElementById('volume');
  this.volumeController_ = this.volumeContainer_.getElementsByTagName('span')[0];
  this.volumeProgress_ = this.volumeController_.getElementsByTagName('div')[0];
  this.controlls_ = document.getElementById('controlls');
  this.progressContainer_ = document.getElementById('progressBar');
  this.playProgressBar_ = this.progressContainer_.getElementsByTagName('span')[0];
  this.timeDisplayBlock_= document.getElementById('timevideo');
  this.width = 640;
  this.height = 360;
  this.trackProgressInterval_ = null;
};

VideoPlayer.prototype.preloadContent = function(contentLoadedAction) {
  // If this is the initial user action on iOS or Android device,
  // simulate playback to enable the video element for later program-triggered
  // playback.
  if (this.isMobilePlatform()) {
	  this.contentPlayer.src = 'http://cdn.test.pladform.ru/video/1936/test3.mp4?md5=2HmC59IFlpkkKX_UPiCoTA&expires=1422294798';
	  this.contentPlayer.addEventListener(
        'loadedmetadata',
        contentLoadedAction,
        false);
	  this.contentPlayer.load();
  } else {
	  contentLoadedAction();
  }
  
  this.setVolumeControll();
  this.setProgressControll();

};
/**
 * метод скрывает контролы на моб.устройствах
 */
VideoPlayer.prototype.hideMobileControlls = function(){
	this.volumeContainer_.parentNode.removeChild(this.volumeContainer_);
};

VideoPlayer.prototype.detectScreenSize = function() {
	try{
		
		if (!this.isMobilePlatform()) {
			return {width: window.screen.width, height: window.screen.height};
		} else {
			if (window.orientation == 0) {
				return {width : window.screen.width, height : window.screen.height};
			} else {
				return {width : window.screen.height, height : window.screen.width};
			}
		}
		
	} catch(e) {
		alert(e.toString());
	}
};

VideoPlayer.prototype.updateTimeDisplay = function() {
	this.timeDisplayBlock_.innerHTML = this.formatTime(this.contentPlayer.currentTime) 
	+ ' / ' + this.formatTime(this.contentPlayer.duration);
};

VideoPlayer.prototype.formatTime = function(seconds) {
	var sec = Math.round(seconds);
	var hour = Math.floor(sec / 3600);
	var min = Math.floor(Math.floor(sec % 3600) / 60);
	
	min = min < 10 ? ('0' + min) : min;
	sec = Math.floor(sec % 60);
	sec = sec < 10 ? ('0' + sec) : sec;

	return (hour > 0 ? hour + ':' : '') + min + ':'  + sec;
};

VideoPlayer.prototype.setTrackPlayProgress = function(clickX) {
	var newPercent = Math.max(0, Math.min(1, (clickX - this.findPosX(this.progressContainer_)) / this.progressContainer_.offsetWidth));
	this.contentPlayer.currentTime = newPercent * this.contentPlayer.duration;
	this.trackPlayProgress();
};

VideoPlayer.prototype.trackPlayProgress = function() {
	var self_ = this;
	this.trackProgressInterval_= setInterval(function(){ return self_.updatePlayProgress.call(self_); }, 33);
};

VideoPlayer.prototype.stopTrackPlayProgress = function() {
	clearInterval(this.trackProgressInterval_);
};

VideoPlayer.prototype.updatePlayProgress = function() {
	this.playProgressBar_.style.width = (this.contentPlayer.currentTime / this.contentPlayer.duration) * (this.progressContainer_.offsetWidth) + "px";
	this.updateTimeDisplay();
};

VideoPlayer.prototype.showControlls = function() {
	this.controlls_.style.display = 'block';	
};

VideoPlayer.prototype.hideControlls = function() {
	this.controlls_.style.display = 'none';	
};

VideoPlayer.prototype.play = function() {
	this.contentPlayer.play();
	this.trackPlayProgress();
};

VideoPlayer.prototype.pause = function() {
	this.contentPlayer.pause();
	this.stopTrackPlayProgress();
};

VideoPlayer.prototype.isMobilePlatform = function() {
  return this.contentPlayer.paused &&
      (navigator.userAgent.match(/(iPod|iPhone|iPad)/i) ||
       navigator.userAgent.toLowerCase().indexOf('android') > -1);
};

VideoPlayer.prototype.detectMobilePlatform = function(){
	
	var isMobile = {
			Android: function() {
		        return navigator.userAgent.match(/Android/i);
		    },
		    BlackBerry: function() {
		        return navigator.userAgent.match(/BlackBerry/i);
		    },
		    iOS: function() {
		        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		    },
		    Opera: function() {
		        return navigator.userAgent.match(/Opera Mini/i);
		    },
		    Windows: function() {
		        return navigator.userAgent.match(/IEMobile/i);
		    },
		    any: function() {
		        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		    }
		};
	
	return isMobile.any() ? isMobile : false;
	
};

VideoPlayer.prototype.setRemainingTime = function(time) {
	var min = Math.floor(Math.floor(time) / 60);
	var sec = Math.floor(time) - (min * 60);
	this.adRemainingBlock.innerHTML = 'До конца рекламы: (' + (min < 10 ? '0' + min : min ) + ':' + (sec < 10 ? '0' + sec : sec) + ')';
};

VideoPlayer.prototype.clearRemainingBlock = function() {
	this.adRemainingBlock.innerHTML = '';
};

VideoPlayer.prototype.resize = function(
    position, top, left, width, height) {
  this.videoPlayerContainer_.style.position = position;
  this.videoPlayerContainer_.style.top = top + 'px';
  this.videoPlayerContainer_.style.left = left + 'px';
  this.videoPlayerContainer_.style.width = width + 'px';
  this.videoPlayerContainer_.style.height = height + 'px';
  this.contentPlayer.style.width = width + 'px';
  this.contentPlayer.style.height = height + 'px';
};

VideoPlayer.prototype.setClassName = function(className) {
	this.videoPlayerContainer_.className = className;
};

VideoPlayer.prototype.registerVideoEndedCallback = function(callback) {
  this.contentPlayer.addEventListener(
      'ended',
      callback,
      false);
};

VideoPlayer.prototype.findPosX = function(obj){
	var curLeft = obj.offsetLeft;
	while(obj = obj.offsetParent) {
		curLeft += obj.offsetLeft;
	}
	return curLeft;
};

VideoPlayer.prototype.setVolume = function(clickX){
	var newVol = (clickX - this.findPosX(this.volumeController_)) / this.volumeController_.offsetWidth;
	if (newVol > 1) {
		newVol = 1;
	} else if (newVol < 0) {
		newVol = 0;
	}
	this.contentPlayer.volume = newVol;
	this.updateVolumeDisplay();
};

VideoPlayer.prototype.updateVolumeDisplay = function() {
	this.volumeProgress_.style.width = (this.volumeController_.offsetWidth * this.contentPlayer.volume) + 'px';
};

VideoPlayer.prototype.setProgressControll =  function(){
	var self_ = this;
	
	this.progressContainer_.addEventListener("mousedown", function(e){
		self_.stopTrackPlayProgress();
		if (self_.contentPlayer.paused) {
			videoWasPlaying = false;
		} else {
			videoWasPlaying = true;
			self_.pause();
		}
		document.onmousemove =function(e){
			self_.setTrackPlayProgress(e.pageX);
		};
		document.onmouseup = function(e){
			document.onmousemove = null;
			document.onmouseup = null;
			if (videoWasPlaying) {
				self_.contentPlayer.play();
				self_.setTrackPlayProgress(e.pageX);
			}
		};
	}, true);
	
	this.progressContainer_.addEventListener("mouseup", function(e){
		self_.setTrackPlayProgress(e.pageX);
	}, true);
	
};

VideoPlayer.prototype.setVolumeControll = function(){
	var self_ = this;
	this.volumeController_.addEventListener("mousedown", function(e){
		self_.setVolume(e.pageX);  
		document.onmousemove = function(e) {
			  self_.setVolume(e.pageX);
		};
		document.onmouseup = function(e) {
			  document.onmousemove = null;
			  document.onmouseup = null;
		};
	  }, true);

	this.volumeController_.addEventListener("mouseup", function(e){
		self_.setVolume(e.pageX);
	}, true);
};
