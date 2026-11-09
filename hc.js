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
      case 'start': return d?ds:'Chưa có lịch'; case 'startw': return d?WS[d.getDay()]+' '+ds:'Chưa có lịch';
      case 'startlong': return d?WD[d.getDay()]+' '+ds:'Chưa có lịch'; case 'weekday': return d?WD[d.getDay()]:'';
      case 'when': return d?WD[d.getDay()]+' '+ds+(c.time?' · '+c.time:''):'Sẽ thông báo';
      case 'status': return d?'Lớp '+c.code+' · khai giảng '+WD[d.getDay()]+' '+ds+' · '+fmt(a[0]+'.seats')+'.':'Lịch khai giảng sẽ được thông báo. Đăng ký nhận tin để được báo sớm nhất.';
      case 'next': return d?'Khai giảng '+WS[d.getDay()]+' '+ds+'.':'Nhận tin khi mở lớp.';
      case 'time': return c.start&&c.time?c.time:'Chưa có lịch'; case 'code': return c.start&&c.code?c.code:'Sắp mở';
      case 'seats': return !c.start&&c.cohorts?'Sắp mở lớp':left?'Còn '+left+'/'+c.capacity+' chỗ':'Hết chỗ';
      case 'left': if(!c.start&&c.cohorts)return 'Sắp mở'; return left+'/'+c.capacity;
      case 'leftn': return String(left); case 'cap': return String(c.capacity);
      case 'base': case 'sale': case 'deposit': return c[f]?k(c[f]):'';
      case 'pp': return c.sale?k(Math.round(c.sale/(c.capacity||10))):'';
      default: return c[f]==null?'[CHƯA CÓ]':String(c[f]);
    }
  }
  function run(){var els=document.querySelectorAll('[data-hc]');for(var i=0;i<els.length;i++){var v=fmt(els[i].getAttribute('data-hc'));if(v!=null)els[i].textContent=v;}
    var ts=document.querySelectorAll('[data-hct]');for(var j=0;j<ts.length;j++){ts[j].textContent=ts[j].getAttribute('data-hct').replace(/\{(\w+\.\w+)\}/g,function(_,key){var v=fmt(key);return v==null?'':v;});}}
  /* Khoá chưa có lớp nào đang mở trên web (Sheet: không có dòng khai giảng hoặc "Hiện trên web" = Không)
     -> nút Đăng ký/Giữ chỗ đổi thành "Báo khi mở lớp" (danh sách chờ); có lớp lại thì trả về như cũ. Thiếu nhi giữ luồng riêng. */
  function closed(cid){var c=D[cid];return !!(c&&c.cohorts&&cid!=='kids'&&!c.start);}
  function lab(t,txt){return txt+(/→\s*$/.test(t)?' →':'');}
  function swap(el,cid,to,txt){el.setAttribute('data-hc-sw',cid);el.setAttribute('data-hc-orig',el.innerHTML);el.setAttribute('data-hc-oact',el.getAttribute('data-hc-act'));el.setAttribute('data-hc-act',to+':'+cid);
    var sp=el.firstElementChild&&el.firstElementChild.tagName==='SPAN'&&el.children.length===1?el.firstElementChild:el;sp.textContent=lab(el.textContent,txt);}
  function back(el){el.setAttribute('data-hc-act',el.getAttribute('data-hc-oact'));var o=el.getAttribute('data-hc-orig');if(o!=null)el.innerHTML=o;['data-hc-sw','data-hc-orig','data-hc-oact'].forEach(function(a){el.removeAttribute(a);});}
  /* Nút tự đổi theo lịch lớp: khoá chưa có lớp mở -> "Báo khi mở lớp" (danh sách chờ); khoá vừa có lớp -> nút danh sách chờ thành "Đăng ký". */
  function gate(){var els=document.querySelectorAll('[data-hc-act^="reg:"],[data-hc-act^="waitlist:"],[data-hc-sw]'),ch=false;
    for(var i=0;i<els.length;i++){var el=els[i],sw=el.getAttribute('data-hc-sw');
      if(sw){var oa=el.getAttribute('data-hc-oact')||'';if((oa.indexOf('reg:')===0)===closed(sw))continue;back(el);ch=true;}
      var a=el.getAttribute('data-hc-act'),k=a.split(':')[0],cid=a.slice(k.length+1),c=D[cid];if(!c||!c.cohorts||cid==='kids')continue;
      if(k==='reg'&&closed(cid))swap(el,cid,'waitlist','Báo khi mở lớp');
      else if(k==='waitlist'&&!closed(cid))swap(el,cid,'reg','Đăng ký'+(el.textContent.length>16?' '+(c.en||''):''));}
    if(ch)run();}
  /* Trang khoá: khi có từ 2 lớp sắp khai giảng trở lên -> liệt kê đủ, mỗi lớp một nút giữ chỗ chọn sẵn lớp đó */
  function lists(){var bx=document.querySelectorAll('[data-hc-list]');if(!bx.length)return;
    var t=new Date(),td=t.getFullYear()+'-'+p(t.getMonth()+1)+'-'+p(t.getDate());
    for(var i=0;i<bx.length;i++){var cid=bx[i].getAttribute('data-hc-list'),c=D[cid],cs=(c&&c.cohorts||[]).filter(function(x){return x.start&&x.start>=td;}).sort(function(a,b){return a.start<b.start?-1:1;});
      if(cs.length<2){bx[i].innerHTML='';continue;}
      bx[i].innerHTML='<div style="margin-top:14px;background:#FFFFFF;border-radius:16px;padding:14px 16px"><div style="font-size:12px;font-weight:700;letter-spacing:1px;color:#8A4B00;margin-bottom:4px">CÁC LỚP SẮP KHAI GIẢNG</div>'
        +cs.map(function(x,j){var d=new Date(x.start+'T00:00:00'),l=Math.max(0,(x.capacity||0)-(x.enrolled||0));
          return '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 14px;padding:10px 0;'+(j?'border-top:1px solid rgba(26,26,26,0.08)':'')+'"><div style="font-size:14px;line-height:1.5"><b>'+(x.code||'')+'</b> · '+WS[d.getDay()]+' '+p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()+(x.time?' · '+x.time:'')+'<br><span style="font-size:12px;font-weight:700;color:'+(l?'#8A4B00':'rgba(26,26,26,0.5)')+'">'+(l?'Còn '+l+'/'+x.capacity+' chỗ':'Hết chỗ')+'</span></div>'
            +(l?'<a href="#" data-hc-act="reg:'+cid+':'+x.code+'" style="background:#1A1A1A;color:#F5EFE3;text-decoration:none;padding:9px 16px;border-radius:100px;font-weight:700;font-size:13px;white-space:nowrap">Giữ chỗ lớp '+(x.code||'')+'</a>':'')+'</div>';}).join('')+'</div>';}}
  function all(){run();gate();lists();}
  window.HC_refresh=function(){derive();all();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',all);else all();
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
  /* 3 lớp, từ nhanh đến mới nhất: (1) bản đã nhớ trên máy khách, (2) ảnh chụp hc-live.json trên chính web (~0,2 giây, cập nhật 10 phút/lần),
     (3) hỏi thẳng Apps Script (2–6 giây, mới nhất). Bản mới hơn luôn ghi đè; Apps Script về rồi thì bỏ qua ảnh chụp đến muộn. */
  var live=false;
  try{ var c=JSON.parse(localStorage.getItem(KEY)||'null'); if(c&&c.data&&Date.now()-c.t<864e5) apply(c.data); }catch(e){}
  fetch('/hc-live.json?t='+Math.floor(Date.now()/6e4)).then(function(r){return r.ok?r.json():null;}).then(function(d){ if(d&&!live) apply(d); }).catch(function(){});
  fetch(C.formUrl+'?action=data').then(function(r){return r.json();}).then(function(j){
    if(!j||!j.data) return;
    live=true;
    try{ localStorage.setItem(KEY,JSON.stringify({t:Date.now(),data:j.data})); }catch(e){}
    apply(j.data);
  }).catch(function(){});
})();
/* Thanh nổi mobile:
   - Trang có [data-bar-start] (trang chủ): chỉ hiện khi đã cuộn tới khối đó, ẩn khi khối [data-bar-hide] (đã có nút đăng ký) đang hiện.
   - Trang khác: cuộn xuống đọc thì ẩn, cuộn lên thì hiện lại.
   - Nút × tắt thanh trong phiên truy cập. */
(function(){
  var bars=document.querySelectorAll('[data-hc-bar]'); if(!bars.length) return;
  var KEY='hc-bar-off'; function dismissed(){try{return sessionStorage.getItem(KEY)==='1';}catch(e){return false;}}
  function set(off){for(var i=0;i<bars.length;i++)bars[i].classList.toggle('off',off||dismissed());}
  document.addEventListener('click',function(e){var x=e.target.closest&&e.target.closest('[data-bar-x]');if(!x)return;e.preventDefault();try{sessionStorage.setItem(KEY,'1');}catch(err){}set(true);});
  function vis(el){return !!(el.offsetParent||el.getClientRects().length);}
  var start=[].filter.call(document.querySelectorAll('[data-bar-start]'),vis)[0];
  var hides=[].filter.call(document.querySelectorAll('[data-bar-hide]'),vis);
  var last=window.pageYOffset||0, ticking=false;
  function inView(el){var r=el.getBoundingClientRect(),V=window.innerHeight;return r.top<V*0.9&&r.bottom>V*0.5;}
  /* Nút đăng ký có sẵn trong trang đang hiện trên màn hình thì ẩn thanh nổi, tránh hai nút trùng nhau */
  function ctaInView(){var V=window.innerHeight,a=document.querySelectorAll('[data-hc-act^="reg"]');
    for(var i=0;i<a.length;i++){var el=a[i];if(el.closest('[data-hc-bar]')||el.closest('.mnav')||!vis(el))continue;var r=el.getBoundingClientRect();if(r.top<V-70&&r.bottom>60)return true;}return false;}
  function tick(){ticking=false;var y=window.pageYOffset||0;
    if(start){var past=start.getBoundingClientRect().top<window.innerHeight*0.6;var hid=hides.some(inView)||ctaInView();set(!past||hid);return;}
    var d=y-last;
    if(ctaInView()){set(true);}else if(y<400){set(true);}else if(d>8){set(true);}else if(d<-8){set(false);}
    if(Math.abs(d)>8)last=y;}
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(tick);}},{passive:true});
  window.addEventListener('resize',function(){start=[].filter.call(document.querySelectorAll('[data-bar-start]'),vis)[0];hides=[].filter.call(document.querySelectorAll('[data-bar-hide]'),vis);tick();});
  tick();
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

/* Menu mobile: vuốt từ mép phải màn hình (1/3 phía trên) sang trái để mở; vuốt sang phải trên menu để đóng */
(function(){
  var sx=0,sy=0,mode=null;
  function cb(){return document.getElementById('m-nav');}
  function setOpen(o){var c=cb();if(!c)return;c.checked=o;document.documentElement.style.overflow=o?'hidden':'';}
  document.addEventListener('touchstart',function(e){var t=e.touches[0],c=cb();if(!c||!(c.offsetParent||c.closest('.v-mob')&&getComputedStyle(c.closest('.v-mob')).display!=='none'))return;mode=null;sx=t.clientX;sy=t.clientY;
    if(c.checked){if(e.target.closest&&e.target.closest('.mnav'))mode='close';}
    else if(sx>window.innerWidth-28&&sy<window.innerHeight/3)mode='open';},{passive:true});
  document.addEventListener('touchmove',function(e){if(!mode)return;var t=e.touches[0],dx=t.clientX-sx,dy=t.clientY-sy;
    if(Math.abs(dy)>70){mode=null;return;}
    if(mode==='open'&&dx<-40){setOpen(true);mode=null;}
    else if(mode==='close'&&dx>60&&Math.abs(dx)>Math.abs(dy)*1.5){setOpen(false);mode=null;}},{passive:true});
})();

/* Menu phụ của bài dài: tô sáng phần đang đọc */
(function(){
  var navs=[].slice.call(document.querySelectorAll('[data-spy]')); if(!navs.length) return;
  var sets=navs.map(function(nav){return [].slice.call(nav.querySelectorAll('a[href^="#"]')).map(function(a){return {a:a,t:document.getElementById(a.getAttribute('href').slice(1))};}).filter(function(x){return x.t;});});
  function tick(){sets.forEach(function(L){var cur=null;L.forEach(function(x){if(x.t.offsetParent!==null&&x.t.getBoundingClientRect().top<240)cur=x;});L.forEach(function(x){x.a.classList.toggle('on',x===cur);});});}
  var tk=false;window.addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(function(){tk=false;tick();});}},{passive:true});
  document.addEventListener('toggle',tick,true);tick();
})();
/* Cộng đồng: cửa sổ "Xem diễn" (đang chuẩn bị bán vé) và "Jam cộng đồng" — gắn bằng data-cd="show|jam" */
(function(){
  var C=window.HC_CONFIG||{}, FB='https://www.facebook.com/share/1FRAFYfvux/', MAIL=C.email||'daongocha23@gmail.com';
  var mailto=function(s,b){return 'mailto:'+MAIL+'?subject='+encodeURIComponent(s)+'&body='+encodeURIComponent(b);};
  var P={
    show:{img:'/img/ab-audience-laugh.webp',alt:'Khán giả cười trong một đêm diễn ứng tác của High Club',k:'XEM DIỄN · ĐANG CHUẨN BỊ',h:'Sân khấu High Club sắp mở lại',
      t:'<p>Trang bán vé đang được xây dựng. High Club sẽ mở bán vé các đêm diễn ứng tác trong thời gian sớm nhất.</p><p>Mỗi đêm diễn không có kịch bản: khán giả gợi ý, diễn viên dựng cảnh ngay tại chỗ, nên không đêm nào giống đêm nào.</p>',
      b:'<a class="hcm-b" href="'+FB+'" target="_blank" rel="noopener">Theo dõi fanpage để nhận lịch diễn</a><a class="hcm-b o" href="'+(C.zalo||'#')+'" target="_blank" rel="noopener">Nhắn Zalo giữ chỗ sớm</a>'},
    jam:{img:'/img/ab-garden-show.webp',alt:'Một buổi chơi ứng tác ngoài trời cùng khán giả',k:'JAM CỘNG ĐỒNG · SẼ TỔ CHỨC',h:'Một sân chơi ứng tác mở cho mọi người',
      t:'<p>Jam là buổi chơi ứng tác mở: học viên cũ, người mới, người chỉ tò mò đều có thể đến. Không chấm điểm, không cần kinh nghiệm. Mọi người cùng chơi vài trò ứng tác, dựng vài cảnh ngắn, rồi ngồi lại nói chuyện.</p><p>Chúng tôi muốn Jam là nơi người học ứng tác có chỗ để tiếp tục chơi sau khoá học, và người mới có một cửa vào nhẹ nhàng. Những tiếng cười ở Jam thường là khởi đầu của những tình bạn mới.</p><p><b>Jam sẽ được tổ chức sau</b>, khi các lớp đầu tiên đã khai giảng. Muốn được báo sớm, hoặc muốn góp ý, góp chỗ, cùng tổ chức? Gửi email cho High Comedia.</p>',
      b:'<a class="hcm-b" href="'+mailto('Mình muốn tham gia Jam cộng đồng','Chào High Comedia,\n\nMình tên là: \nSố điện thoại (Zalo): \nMình muốn: (được báo khi có Jam / cùng tổ chức / góp chỗ / khác)\n\n')+'">Gửi email cho High Comedia</a><a class="hcm-b o" href="'+(C.zalo||'#')+'" target="_blank" rel="noopener">Nhắn Zalo</a>'}
  };
  var css='.hcm{position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,20,20,.62);opacity:0;transition:opacity .2s}.hcm.on{opacity:1}'
   +'.hcm-c{position:relative;background:#F5EFE3;color:#1A1A1A;border-radius:22px;max-width:560px;width:100%;max-height:calc(100vh - 32px);overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.35);transform:translateY(14px);transition:transform .25s;font-family:"Be Vietnam Pro",sans-serif}.hcm.on .hcm-c{transform:none}'
   +'.hcm-c img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}.hcm-in{padding:20px 24px 24px}.hcm-k{font-size:11.5px;font-weight:700;letter-spacing:1.4px;color:#8A4B00}'
   +'.hcm-h{font-family:"Bricolage Grotesque",sans-serif;font-size:27px;line-height:1.12;font-weight:800;margin:6px 0 10px}.hcm-t p{margin:0 0 10px;font-size:15px;line-height:1.6;color:rgba(26,26,26,.82)}'
   +'.hcm-bs{display:flex;flex-direction:column;gap:8px;margin-top:16px}.hcm-b{display:block;text-align:center;padding:13px 18px;border-radius:100px;background:#1A1A1A;color:#F5EFE3!important;font-weight:700;font-size:15px;text-decoration:none}.hcm-b.o{background:transparent;color:#1A1A1A!important;border:1.5px solid #1A1A1A}'
   +'.hcm-x{position:absolute;top:10px;right:10px;width:38px;height:38px;border-radius:50%;border:0;background:rgba(245,239,227,.94);font-size:18px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.2)}'
   +'@media (max-width:600px){.hcm{align-items:flex-end;padding:0}.hcm-c{border-radius:22px 22px 0 0;max-height:92vh;transform:translateY(40px)}.hcm-in{padding:18px 18px calc(22px + env(safe-area-inset-bottom))}.hcm-h{font-size:24px}}';
  var st=null,last=null;
  function close(){var m=document.querySelector('.hcm');if(!m)return;m.classList.remove('on');setTimeout(function(){m.remove();},200);document.documentElement.style.overflow='';if(last)try{last.focus();}catch(e){}}
  function open(k,src){var d=P[k];if(!d)return;if(!st){st=document.createElement('style');st.textContent=css;document.head.appendChild(st);}
    last=src;var m=document.createElement('div');m.className='hcm';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label',d.h);
    m.innerHTML='<div class="hcm-c"><button type="button" class="hcm-x" aria-label="Đóng">✕</button><img src="'+d.img+'" alt="'+d.alt+'"><div class="hcm-in"><div class="hcm-k">'+d.k+'</div><div class="hcm-h">'+d.h+'</div><div class="hcm-t">'+d.t+'</div><div class="hcm-bs">'+d.b+'</div></div></div>';
    document.body.appendChild(m);document.documentElement.style.overflow='hidden';requestAnimationFrame(function(){m.classList.add('on');});m.querySelector('.hcm-x').focus();
    try{if(window.HC_track)HC_track('community_open',{item:k});}catch(e){}}
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-cd]');
    if(a){e.preventDefault();open(a.getAttribute('data-cd'),a);return;}
    var m=e.target.closest&&e.target.closest('.hcm');if(m&&(e.target===m||e.target.closest('.hcm-x')))close();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  if(/^#(xem-dien|jam)$/.test(location.hash))setTimeout(function(){open(location.hash==='#jam'?'jam':'show');},300);
})();
