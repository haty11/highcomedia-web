/* High Comedia · đo lường (GA4 + Microsoft Clarity). Chỉ chạy trên tên miền thật.
   Sự kiện gửi GA4:
   - form_open      mở form (form_type, course)
   - generate_lead  gửi form THÀNH CÔNG (form_type, course) ← chỉ số chính
   - form_error     gửi lỗi
   - click_register bấm nút đăng ký/giữ chỗ (course)
   - click_zalo / click_call / click_email / click_facebook */
(function(){
  var C=window.HC_CONFIG||{}, h=location.hostname;
  if(!/(^|\.)highcomedia\.com$/.test(h)) return;
  // GA4 (gtag đã chèn trong <head> lúc deploy; nếu thiếu thì tự nạp)
  window.dataLayer=window.dataLayer||[];
  if(!window.gtag){ window.gtag=function(){dataLayer.push(arguments);};
    if(C.ga){ var s=document.createElement('script'); s.async=1; s.src='https://www.googletagmanager.com/gtag/js?id='+C.ga; document.head.appendChild(s);
      gtag('js',new Date()); gtag('config',C.ga); } }
  // Microsoft Clarity
  if(C.clarity){ (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window,document,"clarity","script",C.clarity); }
  var PG=(location.pathname.match(/khoa-hoc-([\w-]+?)(?:\.html)?$/)||[])[1]||'';
  PG={'drop-in':'dropin','improv-1':'improv1','improv-2':'improv2','performer-1':'performer1','performer-2':'performer2','kids':'kids'}[PG]||'';
  function ev(n,p){ try{ p=p||{}; p.page_path=location.pathname; gtag('event',n,p);
    if(window.clarity) clarity('event',n); }catch(e){} }
  window.HC_track=ev;
  var NAME={dropin:'Drop-in',improv1:'Improv 1',improv2:'Improv 2',performer1:'Performer 1',performer2:'Performer 2',kids:'Kids',applied:'Doanh nghiệp'};
  window.addEventListener('hc:form',function(e){ var d=e.detail||{}, p={form_type:d.form||'',course:NAME[d.cls||PG]||d.cls||''};
    if(d.type==='open') ev('form_open',p);
    else if(d.type==='success'){ ev('generate_lead',p); if(window.clarity) clarity('set','lead',p.form_type); }
    else if(d.type==='error') ev('form_error',p); });
  document.addEventListener('click',function(e){ var a=e.target.closest&&e.target.closest('a,button'); if(!a) return;
    var act=a.getAttribute('data-hc-act'), href=a.getAttribute('href')||'';
    if(act){ var k=act.split(':')[1]||PG; ev('click_register',{course:NAME[k]||k,label:(a.textContent||'').trim().slice(0,40)}); return; }
    if(/zalo\.me/.test(href)) ev('click_zalo');
    else if(/^tel:/.test(href)) ev('click_call');
    else if(/^mailto:/.test(href)) ev('click_email');
    else if(/facebook\.com/.test(href)) ev('click_facebook');
  },true);
})();
