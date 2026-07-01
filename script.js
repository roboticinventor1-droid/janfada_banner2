let selectedColor = "#ffff00";
let animationId = null;
let moveDirection = "ltr"; 
let currentEffect = "none";

/* ---------- سرعت ---------- */
function updateSpeedLabel(){
    const speed = Number(document.getElementById("speed").value);
    let text = "🚶 متوسط";

    if(speed===1) text="🐌 خیلی کند";
    if(speed===2) text="🐢 کند";
    if(speed===3) text="🚶 متوسط";
    if(speed===4) text="🚀 سریع";
    if(speed===5) text="⚡ خیلی سریع";

    document.getElementById("speedLabel").innerText = text;
}

/* ---------- قابلیت‌های پیشرفته ---------- */
function toggleDirection() {
    const btn = document.getElementById("directionBtn");
    if (moveDirection === "ltr") {
        moveDirection = "rtl";
        btn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> جهت: راست به چپ';
    } else {
        moveDirection = "ltr";
        btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> جهت: چپ به راست';
    }
}

function changeEffect(val) {
    currentEffect = val;
}

/* ---------- رنگ ---------- */
function selectColor(el){
    document.querySelectorAll(".color").forEach(c => c.classList.remove("active"));
    el.classList.add("active");
    selectedColor = el.dataset.color;
    updatePreview();
}

/* ---------- پیش نمایش ---------- */
function updatePreview(){
    const preview = document.getElementById("preview");
    let txt = document.getElementById("userText").value;

    if(txt.length > 20){
        txt = txt.substring(0,20) + " ...";
    }

    preview.innerText = txt || "متن نمونه";
    preview.style.color = selectedColor;
    preview.style.textShadow='none';
}

/* ---------- نمایش بنر ---------- */
function startBanner(){
    const text = document.getElementById("userText").value.trim();

    if(!text){
        alert("لطفاً متن را وارد کنید");
        return;
    }

    // بستن اجباری کیبورد برای جلوگیری از برهم‌خوردن موقعیت صفحات در موبایل
    document.getElementById("userText").blur();

    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }

    document.getElementById("inputPage").style.display="none";
    document.getElementById("bannerPage").style.display="flex";

    const banner = document.getElementById("bannerText");
    banner.innerText = text;
    
    const chosenSize = document.getElementById("fontSizeSlider").value;
    banner.style.fontSize = chosenSize + "vh";
    banner.style.color = selectedColor;
    
    banner.className = "";
    if (currentEffect !== "none") {
        banner.classList.add(currentEffect + "-animation");
    }

    setTimeout(()=>{
        const textWidth = banner.offsetWidth;
        const level = Number(document.getElementById("speed").value);
        let pixelsPerFrame;

        switch(level){
            case 1: pixelsPerFrame = 5; break;
            case 2: pixelsPerFrame = 10; break;
            case 3: pixelsPerFrame = 15; break;
            case 4: pixelsPerFrame = 20; break;
            case 5: pixelsPerFrame = 25; break;
        }

        let x = (moveDirection === "rtl") ? window.innerWidth : -textWidth;
        cancelAnimationFrame(animationId);

        function animate(){
            if (moveDirection === "rtl") {
                x -= pixelsPerFrame;
                if(x < -textWidth){
                    x = window.innerWidth;
                }
            } else {
                x += pixelsPerFrame;
                if(x > window.innerWidth){
                    x = -textWidth;
                }
            }
            
            banner.style.left = x + "px";
            animationId = requestAnimationFrame(animate);
        }
        animate();
    }, 150);
}

/* ---------- بازگشت ---------- */
function goBack(){
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else if (document.webkitFullscreenElement) {
        document.webkitExitFullscreen();
    }

    cancelAnimationFrame(animationId);
    document.getElementById("bannerText").className = "";
    document.getElementById("bannerPage").style.display="none";
    document.getElementById("inputPage").style.display="flex";

    // ترفند صفر کردن اسکرول برای بازگرداندن کادر دقیقاً به وسط مانیتور گوشی
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
}

updatePreview();
updateSpeedLabel();

/* ---------- مدیریت حافظه جملات (LocalStorage) - اصلاح‌شده و هوشمند ---------- */
let defaultSentences=[
    "مرگ بر آمریکا",
    "آمریکا شیطان بزرگ و اسرائیل غده سرطانی است",
    "نه اصلاح طلب نه اصولگرا ، ما علی الاصول گرا هستیم",
    "علی الاصول ما با آمریکا پدرکشتگی داریم",
    "علی الاصول مسیر حسین و شمر جداست",
    "قاتل امام خامنه‌ای جان سالم ببرد نامردیم",
    "فرزندان خمینی آمریکا را پنچر کردند",
    "فرزندان خامنه‌ای آمریکا را زیر پا له کردند",
    "مردم ایران پوزه‌ی آمریکا را به خاک مالیدند",
    "آمریکا باید بی قید و شرط تسلیم شود و زانو بزند",
    "آماده‌ی نبرد بی‌انتها با آمریکا هستیم" ,
    "مرگ بر اسرائیل",
    "ما خون را با خون میشوییم نه با مذاکره",
    "ریختن خون ترامپ و نتانیاهو خواسته امام زمان است",
    "ما همه خون خواه پدر ، گوش به فرمان پسر ",
    " قاتل رهبر رو بزن؛ ضربه آخر رو بزن ",
    " ایستاده‌ایم تا ظهور ",
    " رهبرمون هرچی بگه همونه ",
    " نه سازش، نه تسلیم؛ نبرد با آمریکا ",
    " با آل علی هرکه در افتاد ور افتاد ",
    " تا این پرچم بلنده، ایرانی سر بلنده "
];

let saved = JSON.parse(localStorage.getItem('sentences') || 'null');

if(!saved){
    // بار اول: کل آرایه ذخیره می‌شود
    saved = [...defaultSentences];
    localStorage.setItem('sentences', JSON.stringify(saved));
} else {
    // دفعات بعدی: جملات جدیدی که در لیست گوشی نیستند را بدون دست زدن به بقیه اضافه می‌کند
    let updated = false;
    defaultSentences.forEach(sentence => {
        if (!saved.includes(sentence.trim())) {
            saved.push(sentence.trim());
            updated = true;
        }
    });
    if (updated) {
        localStorage.setItem('sentences', JSON.stringify(saved));
    }
}

function getSentences(){
    return JSON.parse(localStorage.getItem('sentences') || '[]');
}

function addSentence(text){
    if(!text || !text.trim()) return;
    let arr = getSentences();
    arr.push(text.trim());
    localStorage.setItem('sentences', JSON.stringify(arr));
}

function refreshSentenceSelect(){
    const sel = document.getElementById('sentenceSelect');
    if(!sel) return;
    sel.innerHTML = '';
    getSentences().forEach(function(t, i){
        let op = document.createElement('option');
        op.value = i;
        op.textContent = t;
        sel.appendChild(op);
    });
}

function applySelectedSentence(){
    const sel = document.getElementById('sentenceSelect');
    const userText = document.getElementById('userText');
    const banner = document.getElementById('bannerText');
    if(!sel) return;
    const sentence = sel.options.length ? sel.options[sel.selectedIndex].text : '';
    if(userText) userText.value = sentence;
    if(typeof updatePreview === 'function') updatePreview();
    if(banner) banner.innerText = sentence;
}

function saveNewSentence(){
    const inp = document.getElementById('newSentence');
    if(!inp.value.trim()) return;
    addSentence(inp.value.trim());
    inp.value = '';
    refreshSentenceSelect();
    const sel = document.getElementById('sentenceSelect');
    if(sel){ 
        sel.selectedIndex = sel.options.length - 1; 
        applySelectedSentence(); 
    }
}

document.addEventListener('DOMContentLoaded', function(){ 
    refreshSentenceSelect(); 
    const sel = document.getElementById('sentenceSelect'); 
    if(sel){ 
        sel.addEventListener('change', applySelectedSentence); 
        applySelectedSentence(); 
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const panel = document.getElementById('sentencePanel') ||
                  document.querySelector('.sentence-panel') ||
                  document.querySelector('#sentencesBox');

    const showBtn = [...document.querySelectorAll('button,input[type=button]')]
                    .find(e => /نمایش.*بنر|بنر/.test((e.innerText || e.value || '')));

    if(showBtn && panel){
        showBtn.addEventListener('click', () => { panel.style.display = 'none'; });
    }

    const sel = document.getElementById('sentenceSelect');
    if(sel && !document.getElementById('editSentenceBtn')){
        const editBtn = document.createElement('button');
        editBtn.id = 'editSentenceBtn';
        editBtn.textContent = 'ویرایش جمله';

        const delBtn = document.createElement('button');
        delBtn.id = 'deleteSentenceBtn';
        delBtn.textContent = 'حذف جمله';

        sel.parentNode.appendChild(editBtn);
        sel.parentNode.appendChild(delBtn);

        editBtn.onclick = () => {
            if(sel.selectedIndex < 0) return;
            const current = sel.options[sel.selectedIndex].text;
            const updated = prompt('ویرایش جمله', current);
            if(updated && updated.trim()){
                sel.options[sel.selectedIndex].text = updated.trim();
                sel.options[sel.selectedIndex].value = updated.trim();
                if(typeof applySelectedSentence === 'function') applySelectedSentence();
            }
        };

        delBtn.onclick = () => {
            if(sel.selectedIndex < 0) return;
            if(confirm('این جمله حذف شود؟')){
                sel.remove(sel.selectedIndex);
                if(sel.options.length > 0) sel.selectedIndex = 0;
                if(typeof applySelectedSentence === 'function') applySelectedSentence();
            }
        };
    }
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
    .then((reg) => {
        reg.update();
        console.log("Service Worker registered!");
    })
    .catch(err => console.log("SW registration failed:", err));
}
