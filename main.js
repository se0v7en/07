const pages = document.querySelectorAll('.page');
// 页码 0=page1首页，1=page2，2=page3，3=page4
function goPage(targetIndex){
    pages.forEach(p=>p.classList.remove('active'));
    pages[targetIndex].classList.add('active');
}

// ===== 背景音乐控制 =====
const bgMusic = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
let musicPlay = false;
musicBtn.onclick = function(){
    if(!musicPlay){
        bgMusic.play();
        musicBtn.innerText="暂停音乐";
        musicPlay=true;
    }else{
        bgMusic.pause();
        musicBtn.innerText="播放音乐";
        musicPlay=false;
    }
}

// ===== 暗红色粒子特效 =====
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;
let particles = [];

class Particle{
    constructor(){
        this.x = Math.random()*w;
        this.y = Math.random()*-h;
        this.size = Math.random()*3+1;
        this.speedY = Math.random() + 0.6;
        this.speedX = Math.random()*0.4 -0.2;
        this.color = `rgba(150,25,35,${Math.random()*0.4+0.1})`
    }
    update(){
        this.y += this.speedY;
        this.x += this.speedX;
        if(this.y > h){
            this.y = Math.random()*-20;
            this.x = Math.random()*w;
        }
    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
        ctx.fill();
    }
}
function init(){
    particles=[];
    for(let i=0;i<80;i++){
        particles.push(new Particle())
    }
}
function animate(){
    ctx.clearRect(0,0,w,h);
    for(let p of particles){
        p.update();
        p.draw();
    }
    requestAnimationFrame(animate);
}
init();
animate();
window.addEventListener('resize',()=>{
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    init();
})
