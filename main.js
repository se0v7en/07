const pages = document.querySelectorAll(".page");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
let currentIndex = 0;
const totalPage = pages.length;

//重置所有页面状态
function resetPageState(){
    pages.forEach(p=>{
        p.classList.remove("active","page-flip-out","page-flip-in");
    })
}

//下一页
function goNext(){
    if(currentIndex >= totalPage-1) return;
    resetPageState();
    pages[currentIndex].classList.add("active","page-flip-out");
    currentIndex++;
    setTimeout(()=>{
        pages[currentIndex].classList.add("active","page-flip-in");
    },100);
}

//上一页
function goPrev(){
    if(currentIndex <=0) return;
    resetPageState();
    pages[currentIndex].classList.add("page-flip-out");
    currentIndex--;
    pages[currentIndex].classList.add("active","page-flip-in");
}

nextBtn.addEventListener("click",goNext);
prevBtn.addEventListener("click",goPrev);
