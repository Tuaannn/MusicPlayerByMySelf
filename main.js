const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = "Tuaan";

const playList = $(".playlist");
const cd = $(".cd");
const cdThumb = $(".cd-thumb");
const heading = $(".heading");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $(".progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,

    getConfig: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [
        {
            name: "Thuyền Quyên",
            singer: "Diệu Kiên",
            path: "./assets/song/ThuyenQuyenOrinnRemix-DieuKien-7805774.mp3",
            image: "./assets/images/2ec51983dbff681cc3cb7af20b4c7ad2.jpg",
        },
        {
            name: "Daydreams x Last Christmas",
            singer: "KI AN, Toann",
            path: "./assets/song/DaydreamsXLastChristmasToannRemix-DangCapNhat-12767407.mp3",
            image: "./assets/images/chrismas.jpg",
        },
        {
            name: "Cơm Đoàn Viên",
            singer: "Thành Đạt",
            path: "./assets/song/ComDoanVien-ThanhDat-8504795.mp3",
            image: "./assets/images/cơm đoàn viên.jpg",
        },
        {
            name: "Con Hứa Sẽ Về",
            singer: "Lê Bảo Bình",
            path: "./assets/song/ConHuaSeVe-LeBaoBinh-8477494.mp3",
            image: "./assets/images/con hua se ve.jpg",
        },
        {
            name: "Giờ Không Cưới Thì Nào Cưới",
            singer: "Hồng Quân WyTy, Young P",
            path: "./assets/song/GioKhongCuoiThiNaoCuoi-HongQuanWyTyYoungP-11721897 (1).mp3",
            image: "./assets/images/giờ không cưới thì nào cưới.jpg",
        },
        {
            name: "Thương Biệt Ly",
            singer: "Chu Thúy Quỳnh",
            path: "./assets/song/ThuongLyBietLoiViet-ChuThuyQuynh-11520445.mp3",
            image: "./assets/images/Thương biệt ly.jpg",
        },
        {
            name: "Hoa Điêu Thuyên",
            singer: "Yamix Hầu Ca, Gấu",
            path: "./assets/song/HoaDieuThuyen-YamixHauCaGau-7802919.mp3",
            image: "./assets/images/Hoa điêu thuyền.jpg",
        },
    ],

    render: function () {
        const html = this.songs.map((song, index) => {
            return `
                <div class="song ${
                    index === this.currentIndex ? "active" : ""
                }" data-index = ${index}>
                    <div
                        class="thumb"
                        style="
                            background-image: url('${song.image}');
                        "
                    ></div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
      `;
        });

        playList.innerHTML = html.join("");
    },

    handleEvent: function () {
        const cdWidth = cd.offsetWidth;
        const _this = this;

        document.onscroll = function () {
            const scrollTop =
                window.scrollY || document.documentElement.scrollTop;

            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;

            cd.style.opacity = newCdWidth / cdWidth;
        };

        const cdAnimate = cd.animate([{ transform: "rotate(360deg)" }], {
            duration: 10000,
            iterations: Infinity,
        });
        cdAnimate.pause();

        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        audio.onplay = function () {
            player.classList.add("playing");
            _this.isPlaying = true;

            cdAnimate.play();
        };

        audio.onpause = function () {
            player.classList.remove("playing");
            cdAnimate.pause();

            _this.isPlaying = false;
        };

        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(
                    (audio.currentTime / audio.duration) * 100
                );
                progress.value = progressPercent;
            }
        };

        progress.oninput = function () {
            const seekTime = (audio.duration * progress.value) / 100;

            audio.currentTime = seekTime;
        };

        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }

            if (_this.isPlaying) {
                audio.play();
            }
            progress.value = 0;

            _this.render();
            _this.scrollInterView();
        };

        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.prevSong();
            }

            if (_this.isPlaying) {
                audio.play();
            }
            _this.render();
            progress.value = 0;
            _this.scrollInterView();
        };

        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            randomBtn.classList.toggle("active", _this.isRandom);

            _this.setConfig("isRandom", _this.isRandom);
        };

        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            repeatBtn.classList.toggle("active", _this.isRepeat);

            _this.setConfig("isRepeat", _this.isRepeat);
        };

        audio.onended = function () {
            if (_this.isRandom && !_this.isRepeat) {
                _this.randomSong();
            } else if (_this.isRepeat) {
                _this.loadCurrentSong();
            } else {
                _this.nextSong();
            }

            _this.render();
            audio.play();
        };

        playList.onclick = function (e) {
            const songNode = e.target.closest(".song:not(.active)");

            if (songNode || e.target.closest(".option")) {
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
            }
        };
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();

        if (this.isPlaying) {
            audio.play();
        }
        progress.value = 0;
    },

    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex <= 0) {
            this.currentIndex = this.songs.length - 1;
        }

        this.loadCurrentSong();
    },

    scrollInterView: function () {
        $(".song.active").scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "end",
        });
    },

    randomSong: function () {
        let newCurrentIndex;
        do {
            newCurrentIndex = Math.floor(Math.random() * this.songs.length);
        } while (this.currentIndex == newCurrentIndex);

        this.currentIndex = newCurrentIndex;
        this.loadCurrentSong();
    },

    loadCurrentSong: function () {
        heading.innerHTML = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },

    loadConfig: function () {
        this.isRandom = this.getConfig.isRandom;
        this.isRepeat = this.getConfig.isRepeat;
    },

    start: function () {
        this.loadConfig();
        this.defineProperties();
        this.render();
        this.loadCurrentSong();
        this.handleEvent();

        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    },
};

app.start();

// const ob = {
//     name: "Tuaans",
//     age: 10,
// };

// localStorage.setItem("Tuaan", JSON.stringify(ob));
// const a = JSON.parse(localStorage.getItem("Tuaan"));
// console.log(a);
