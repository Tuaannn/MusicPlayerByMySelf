const url = "http://localhost:3000/songs";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "Tuaan";
const MUSIC_VOLUME = "Tuaannn";

const songName = $(".name");
const author = $(".author");
const audio = $(".audio");
const cd = $(".cd");
const pauseBtn = $(".pause");
const nextBtn = $(".next-song");
const prevBtn = $(".prev-song");
const cdThumb = $(".cd-thumb");
const progress = $(".seek-time");
const volumeControl = $(".volume-range");
const totalTime = $(".total-time");
const second = $(".second");
const repeatBtn = $(".repeat-song");
const randomBtn = $(".random-song");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRepeat: false,
    isRandom: false,

    getConfig: JSON.parse(localStorage.getItem("PLAYER_STORAGE_KEY")) || {},
    setConfig: function (key, value) {
        this.getConfig[key] = value;
        localStorage.setItem(
            "PLAYER_STORAGE_KEY",
            JSON.stringify(this.getConfig)
        );
    },

    getVolume: JSON.parse(localStorage.getItem("MUSIC_VOLUME")) || {},
    setVolume: function (key, value) {
        this.getVolume[key] = value;

        localStorage.setItem("MUSIC_VOLUME", JSON.stringify(this.getVolume));
    },

    getSong: function (data) {
        const _this = this;
        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Ket noi mang khong thanh cong");
                }
                return response.json();
            })
            .then(data)
            .catch((err) => {
                console.error("Đã xảy ra lỗi:", err);
            });
    },

    handleEvents: function (data) {
        const _this = this;
        const cdAnimate = cd.animate([{ transform: "rotate(360deg)" }], {
            iterations: Infinity,
            duration: 10000,
        });

        cdAnimate.pause();

        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent =
                    (audio.currentTime / audio.duration) * 100;
                progress.value = progressPercent;
            }

            second.innerHTML = _this.formatTime(audio.currentTime);
        };

        progress.oninput = function () {
            const seekTime = (audio.duration / 100) * progress.value;
            audio.currentTime = seekTime;
        };

        pauseBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        audio.onplay = function () {
            _this.isPlaying = true;
            cdAnimate.play();
        };

        audio.onpause = function () {
            _this.isPlaying = false;
            cdAnimate.pause();
        };

        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.radomSong(data);
            } else {
                _this.nextSong(data);
            }

            if (_this.isPlaying) {
                audio.play();
            }
        };

        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.radomSong(data);
            } else {
                _this.prevSong(data);
            }

            if (_this.isPlaying) {
                audio.play();
            }
        };

        audio.volume = volumeControl.value / 100;

        volumeControl.oninput = function () {
            var newVolume = volumeControl.value / 100;

            audio.volume = newVolume;

            _this.setVolume("volume", newVolume);
        };

        audio.onended = function () {
            if (_this.isRepeat) {
                _this.loadCurrentSong();
            } else if (_this.isRandom) {
                _this.radomSong(data);
            } else {
                _this.nextSong(data);
            }
            audio.play();
        };

        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            repeatBtn.classList.toggle("active", _this.repeatBtn);

            _this.setConfig("isRepeat", _this.isRepeat);
        };

        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            randomBtn.classList.toggle("active", _this.isRandom);

            _this.setConfig("isRandom", _this.isRandom);
        };
    },

    radomSong: function (data) {
        let newCurrentIndex;

        do {
            newCurrentIndex = Math.floor(Math.random() * data.length);
        } while (newCurrentIndex === this.currentIndex);

        this.currentIndex = newCurrentIndex;

        this.loadCurrentSong();
    },

    loadConfig: function () {
        this.isRandom = this.getConfig.isRandom;
        this.isRepeat = this.getConfig.isRepeat;
    },

    loadVolume: function () {
        newVolume = this.getVolume.volume;
    },

    nextSong: function (data) {
        this.currentIndex++;
        if (this.currentIndex >= data.length) {
            this.currentIndex = 0;
        }

        this.loadCurrentSong();
    },

    prevSong: function (data) {
        this.currentIndex--;
        if (this.currentIndex <= 0) {
            this.currentIndex = data.length - 1;
        }
        this.loadCurrentSong();
    },

    loadCurrentSong: function () {
        const _this = this;
        author.innerHTML = this.currentSong.singer;
        songName.innerHTML = this.currentSong.name;
        cdThumb.style.backgroundImage = `url("${this.currentSong.image}")`;
        audio.src = this.currentSong.path;

        audio.onloadedmetadata = function () {
            const durationSong = audio.duration;
            totalTime.innerHTML = _this.formatTime(durationSong);
        };
    },

    formatTime: function (seconds) {
        let minutes = Math.floor(seconds / 60);
        let remainSeconds = Math.floor(seconds % 60);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        remainSeconds =
            remainSeconds < 10 ? "0" + remainSeconds : remainSeconds;
        return minutes + ":" + remainSeconds;
    },

    defineProperties: function (data) {
        if (Array.isArray(data) && data.length > 0) {
            Object.defineProperty(this, "currentSong", {
                get: function () {
                    return data[this.currentIndex];
                },
            });
        } else {
            console.error("Dữ liệu trống");
        }
    },

    start: function () {
        this.loadConfig();
        this.loadVolume();
        this.getSong(this.defineProperties.bind(this));
        this.getSong(this.loadCurrentSong.bind(this));
        this.getSong(this.handleEvents.bind(this));
        this.getSong(this.nextSong.bind(this));

        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);

        volumeControl.value = newVolume * 100;
    },
};

app.start();
