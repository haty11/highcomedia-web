/* High Comedia: điền lịch lớp, sĩ số, học phí từ window.HC_DATA (hc-data.js) vào mọi [data-hc="lop.truong"]. */
(function(){
  var D=window.HC_DATA; if(!D) return;
  /* Lớp sắp khai giảng gần nhất (ưu tiên còn chỗ) của mỗi khoá -> đưa lên cấp khoá */
  function derive(){var t=new Date(),today=t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2);
    for(var id in D){var c=D[id];if(!c||!c.cohorts)continue;
      var up=c.cohorts.filter(function(x){return x.start&&x.start>=today;}).sort(function(a,b){return a.start<b.start?-1:1;});
      var pick=null;for(var i=0;i<up.length;i++){if((up[i].capacity||0)-(up[i].enrolled||0)>0){pick=up[i];break;}} pick=pick||up[0]||null;
      c.start=pick?pick.start:null;c.time=pick?pick.time:null;c.code=pick?pick.code:null;c.enrolled=pick?(pick.enrolled||0):0;if(pick&&pick.capacity)c.capacity=pick.capacity;}}
  window.HC_derive=derive; derive();
  var WD=['Chủ nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'], WS=['CN','T2','T3','T4','T5','T6','T7'];
  function k(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.')+'K';}
  function p(n){return (n<10?'0':'')+n;}
  function fmt(key){
    var a=key.split('.'), c=D[a[0]], f=a[1]; if(!c) return null;
    var d=c.start?new Date(c.start+'T00:00:00'):null, ds=d?p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear():'[NGÀY]';
    var left=Math.max(0,(c.capacity||0)-(c.enrolled||0));
    switch(f){
      case 'start': return ds; case 'startw': return d?WS[d.getDay()]+' '+ds:'[NGÀY]';
      case 'startlong': return d?WD[d.getDay()]+' '+ds:'[NGÀY]'; case 'weekday': return d?WD[d.getDay()]:'[THỨ]';
      case 'seats': return left?'Còn '+left+'/'+c.capacity+' chỗ':'Hết chỗ';
      case 'left': return left+'/'+c.capacity; case 'leftn': return String(left); case 'cap': return String(c.capacity);
      case 'base': case 'sale': return c[f]?k(c[f]):'';
      default: return c[f]==null?'[CHƯA CÓ]':String(c[f]);
    }
  }
  function run(){var els=document.querySelectorAll('[data-hc]');for(var i=0;i<els.length;i++){var v=fmt(els[i].getAttribute('data-hc'));if(v!=null)els[i].textContent=v;}}
  window.HC_refresh=function(){derive();run();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
/* Video YouTube phát ngay trên trang: bấm vào ảnh [data-yt] thì thay bằng trình phát nhúng (chỉ tải YouTube khi người xem bấm). */
(function(){
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-yt]'); if(!a) return;
    e.preventDefault();
    var id=a.getAttribute('data-yt'), box=document.createElement('div');
    box.style.cssText='position:relative;aspect-ratio:16/9;border-radius:'+(getComputedStyle(a).borderRadius||'16px')+';overflow:hidden;background:#1A1A1A';
    box.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&playsinline=1" title="'+(a.getAttribute('aria-label')||'Video')+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>';
    var wrap=document.createElement('div'); wrap.appendChild(box);
    var fb=document.createElement('a'); fb.href='https://www.youtube.com/watch?v='+id; fb.target='_blank'; fb.rel='noopener noreferrer';
    fb.textContent='Video không hiện? Xem trên YouTube ↗'; fb.style.cssText='display:inline-block;margin-top:8px;font-size:13px;font-weight:700;color:#8A4B00';
    wrap.appendChild(fb); a.replaceWith(wrap);
  });
})();
/* Accordion: mở một mục <details name="..."> thì tự đóng các mục cùng nhóm (dự phòng cho trình duyệt cũ). */
(function(){
  document.addEventListener('toggle',function(e){
    var d=e.target; if(!d.open||d.tagName!=='DETAILS') return; var n=d.getAttribute('name'); if(!n) return;
    var all=document.querySelectorAll('details[name="'+n+'"]');
    for(var i=0;i<all.length;i++) if(all[i]!==d&&all[i].open) all[i].open=false;
  },true);
})();
/* Thẻ lớp: tô xen kẽ 2 nền theo các thẻ ĐANG HIỂN THỊ (chạy lại mỗi khi đổi bộ lọc). */
(function(){
  function paint(){
    var lists=document.querySelectorAll('.kcards');
    for(var i=0;i<lists.length;i++){var n=0,cs=lists[i].querySelectorAll('.kc');
      for(var j=0;j<cs.length;j++){ if(getComputedStyle(cs[j]).display==='none') continue; cs[j].classList.toggle('alt',n%2===1); n++; }}
  }
  document.addEventListener('change',function(e){ if(e.target.classList&&e.target.classList.contains('kf')) paint(); });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();
})();
/* Dữ liệu sống: lịch lớp, học phí, số chỗ lấy từ tab "📅 Lịch lớp" của Google Sheet (qua Apps Script).
   Lần sau khách quay lại: dùng ngay bản đã nhớ (≤24h) rồi cập nhật ngầm. Lỗi mạng -> giữ số liệu có sẵn trong trang. */
(function(){
  var C=window.HC_CONFIG||{}, D=window.HC_DATA, KEY='hc-live-v1';
  if(!C.formUrl||!D||!window.fetch||/claude|localhost|^$/.test(location.hostname)) return;
  function apply(data){
    for(var k in data){ var v=data[k]; if(D[k]&&typeof D[k]==='object'&&v&&typeof v==='object'){ for(var f in v) D[k][f]=v[f]; } else D[k]=v; }
    if(window.HC_refresh) window.HC_refresh();
    try{window.dispatchEvent(new CustomEvent('hc:data'));}catch(e){}
  }
  try{ var c=JSON.parse(localStorage.getItem(KEY)||'null'); if(c&&c.data&&Date.now()-c.t<864e5) apply(c.data); }catch(e){}
  fetch(C.formUrl+'?action=data').then(function(r){return r.json();}).then(function(j){
    if(!j||!j.data) return;
    try{ localStorage.setItem(KEY,JSON.stringify({t:Date.now(),data:j.data})); }catch(e){}
    apply(j.data);
  }).catch(function(){});
})();
/* Thanh nổi mobile: cuộn xuống đọc thì ẩn, cuộn lên thì hiện lại */
(function(){
  var bars=document.querySelectorAll('[data-hc-bar]'); if(!bars.length) return;
  var last=window.pageYOffset||0, ticking=false;
  function set(off){for(var i=0;i<bars.length;i++)bars[i].classList.toggle('off',off);}
  function tick(){ticking=false;var y=window.pageYOffset||0,d=y-last;
    if(y<120){set(false);}else if(d>8){set(true);}else if(d<-8){set(false);}
    if(Math.abs(d)>8)last=y;}
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(tick);}},{passive:true});
})();
/* Accordion mục lục (trang Về High Club): mở mục này thì đóng mục khác, cuộn tới mục vừa mở, nút về mục lục / mục tiếp */
(function(){
  var chs=document.querySelectorAll('details.ab-ch'); if(!chs.length) return;
  function vis(el){return !!(el.offsetParent||el.getClientRects().length);}
  function find(id){var c=[document.getElementById(id),document.getElementById('m-'+id)];for(var i=0;i<c.length;i++)if(c[i]&&vis(c[i]))return c[i];return null;}
  function go(el){var y=el.getBoundingClientRect().top+window.pageYOffset-76;window.scrollTo({top:y,behavior:'smooth'});}
  var viaSum=null;
  document.addEventListener('click',function(e){var s=e.target.closest&&e.target.closest('details.ab-ch>summary');viaSum=s?s.parentNode:null;},true);
  for(var i=0;i<chs.length;i++)chs[i].addEventListener('toggle',function(){var me=this;
    if(!me.open){if(viaSum===me){viaSum=null;var idx=find('muc-luc');if(idx)setTimeout(function(){go(idx);},30);}return;}
    var g=me.getAttribute('name');for(var j=0;j<chs.length;j++)if(chs[j]!==me&&chs[j].getAttribute('name')===g)chs[j].open=false;
    setTimeout(function(){go(me);},30);});
  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('[data-ab-top],[data-ab-open],a[href^="#"]'); if(!t) return;
    if(t.hasAttribute('data-ab-top')){var d=t.closest('details');if(d)d.open=false;var idx=find('muc-luc');if(idx)go(idx);return;}
    if(t.hasAttribute('data-ab-open')){var n=find(t.getAttribute('data-ab-open'));if(n){n.open=true;}return;}
    var id=t.getAttribute('href').slice(1).replace(/^m-/,''),el=find(id);
    if(el&&el.tagName==='DETAILS'){e.preventDefault();el.open=true;}
    else if(el&&id==='muc-luc'){e.preventDefault();go(el);}
  });
  function fromHash(){var h=location.hash.slice(1).replace(/^m-/,''); if(h){var el=find(h); if(el&&el.tagName==='DETAILS') el.open=true;}}
  fromHash(); window.addEventListener('hashchange',fromHash);
})();
