// ─── Storage (GitHub Pages friendly: localStorage) ───────────────────────────
const LEADS_KEY = 'ww_leads';
const ADMIN_PASS = 'WealthWise@2024'; // Change this!

function getLeads(){try{return JSON.parse(localStorage.getItem(LEADS_KEY)||'[]')}catch{return[]}}
function saveLead(d){const l=getLeads();l.unshift({...d,id:Date.now(),date:new Date().toLocaleString('en-IN')});localStorage.setItem(LEADS_KEY,JSON.stringify(l))}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function toggleMenu(){document.getElementById('mobileMenu').classList.toggle('open')}
window.addEventListener('scroll',()=>{
  document.getElementById('nav').style.padding=scrollY>50?'.6rem 5%':'1rem 5%'
})

// ─── Quick Enquiry ────────────────────────────────────────────────────────────
function submitQuickEnquiry(){
  const name=document.getElementById('hqName').value.trim()
  const phone=document.getElementById('hqPhone').value.trim()
  const interest=document.getElementById('hqInterest').value
  if(!name||!phone){alert('Please fill your name and phone number.');return}
  saveLead({name,phone,interest,source:'Hero Quick Enquiry'})
  alert(`✅ Thank you ${name}! We'll call you within 24 hours.`)
  document.getElementById('hqName').value=''
  document.getElementById('hqPhone').value=''
  document.getElementById('hqInterest').value=''
}

// ─── Contact Form ─────────────────────────────────────────────────────────────
function submitForm(e){
  e.preventDefault()
  const f=e.target
  const data={
    name:f.name.value,phone:f.phone.value,
    email:f.email.value,interest:f.interest.value,
    message:f.message.value,source:'Contact Form'
  }
  saveLead(data)
  document.getElementById('formMsg').classList.remove('hidden')
  f.reset()
  setTimeout(()=>document.getElementById('formMsg').classList.add('hidden'),5000)
}

// ─── Calculator Tabs ──────────────────────────────────────────────────────────
function showCalc(id){
  document.querySelectorAll('.calc-box').forEach(b=>b.classList.add('hidden'))
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'))
  document.getElementById('calc-'+id).classList.remove('hidden')
  event.target.classList.add('active')
  if(id==='sip')calcSIP()
  if(id==='compound')calcCI()
  if(id==='retire')calcRetire()
  if(id==='insurance')calcIns()
}

// ─── SIP Calculator ───────────────────────────────────────────────────────────
function fmt(n){return'₹'+Math.round(n).toLocaleString('en-IN')}
function calcSIP(){
  const p=+document.getElementById('sipAmt').value
  const r=+document.getElementById('sipRate').value/100/12
  const n=+document.getElementById('sipYrs').value*12
  document.getElementById('sipAmtV').textContent=fmt(p)
  document.getElementById('sipRateV').textContent=document.getElementById('sipRate').value+'%'
  document.getElementById('sipYrsV').textContent=document.getElementById('sipYrs').value+' yrs'
  const total=p*((Math.pow(1+r,n)-1)/r)*(1+r)
  const inv=p*n
  const ret=total-inv
  document.getElementById('sipInv').textContent=fmt(inv)
  document.getElementById('sipRet').textContent=fmt(ret)
  document.getElementById('sipTotal').textContent=fmt(total)
  drawPie('sipChart',inv,ret,'#1a3560','#c9a84c')
}

// ─── Compound Interest ────────────────────────────────────────────────────────
function calcCI(){
  const p=+document.getElementById('ciPrinc').value
  const r=+document.getElementById('ciRate').value/100
  const n=+document.getElementById('ciYrs').value
  document.getElementById('ciPrincV').textContent=fmt(p)
  document.getElementById('ciRateV').textContent=document.getElementById('ciRate').value+'%'
  document.getElementById('ciYrsV').textContent=n+' yrs'
  const total=p*Math.pow(1+r,n)
  const interest=total-p
  document.getElementById('ciPrincR').textContent=fmt(p)
  document.getElementById('ciInt').textContent=fmt(interest)
  document.getElementById('ciTotal').textContent=fmt(total)
  drawPie('ciChart',p,interest,'#1a3560','#c9a84c')
}

// ─── Retirement Calculator ────────────────────────────────────────────────────
function calcRetire(){
  const age=+document.getElementById('rAge').value
  const retAge=+document.getElementById('rRetAge').value
  const exp=+document.getElementById('rExp').value
  const ret=+document.getElementById('rRet').value/100
  document.getElementById('rAgeV').textContent=age+' yrs'
  document.getElementById('rRetAgeV').textContent=retAge+' yrs'
  document.getElementById('rExpV').textContent=fmt(exp)
  document.getElementById('rRetV').textContent=document.getElementById('rRet').value+'%'
  const yrs=retAge-age
  document.getElementById('rYrs').textContent=yrs+' yrs'
  // inflation-adjusted monthly expense at retirement (7% inflation)
  const futureExp=exp*Math.pow(1.07,yrs)
  // corpus needed = futureExp * 12 * 25 (4% withdrawal rate)
  const corpus=futureExp*12*25
  // SIP needed
  const mr=ret/12,n=yrs*12
  const sip=corpus*mr/(Math.pow(1+mr,n)-1)/(1+mr)
  document.getElementById('rSIP').textContent=fmt(sip)
  const cr=corpus>=10000000?'₹'+(corpus/10000000).toFixed(1)+' Cr':fmt(corpus)
  document.getElementById('rCorpus').textContent=cr
}

// ─── Insurance Calculator ─────────────────────────────────────────────────────
function calcIns(){
  const inc=+document.getElementById('insInc').value
  const dep=+document.getElementById('insDep').value
  const age=+document.getElementById('insAge').value
  document.getElementById('insIncV').textContent=fmt(inc)
  document.getElementById('insDepV').textContent=dep
  document.getElementById('insAgeV').textContent=age+' yrs'
  const cover=inc*(10+dep*1)
  const prem=cover*0.002
  document.getElementById('insCover').textContent=fmt(cover)
  document.getElementById('insPrem').textContent=fmt(prem)
}

// ─── Pie Chart ────────────────────────────────────────────────────────────────
function drawPie(id,a,b,ca,cb){
  const canvas=document.getElementById(id)
  if(!canvas)return
  const ctx=canvas.getContext('2d')
  const t=a+b,r=canvas.width/2-8
  ctx.clearRect(0,0,canvas.width,canvas.height)
  const cx=canvas.width/2,cy=canvas.height/2
  let s=-Math.PI/2
  [[a,ca],[b,cb]].forEach(([v,c])=>{
    const arc=(v/t)*2*Math.PI
    ctx.beginPath();ctx.moveTo(cx,cy)
    ctx.arc(cx,cy,r,s,s+arc)
    ctx.fillStyle=c;ctx.fill()
    s+=arc
  })
  ctx.beginPath();ctx.arc(cx,cy,r*0.55,0,2*Math.PI)
  ctx.fillStyle='rgba(10,22,40,0.6)';ctx.fill()
}

// ─── Init ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded',()=>{
  calcSIP()
  // Intersection Observer for fade-in
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='translateY(0)'}})
  },{threshold:.1})
  document.querySelectorAll('.svc-card,.testi-card,.blog-card').forEach(el=>{
    el.style.opacity='0';el.style.transform='translateY(20px)';el.style.transition='.5s ease'
    obs.observe(el)
  })
})
