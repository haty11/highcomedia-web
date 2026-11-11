/* High Comedia · Form đăng ký (v2)
   - Nút data-hc-act="loai:makhoa" mở hộp đăng ký. loai: reg | waitlist | quote. "reg:" (không mã) = cho chọn khoá. "reg:kids" = mở sẵn chế độ "Đăng ký cho con".
   - Form đăng ký: công tắc "Cho bản thân / Cho con 8–14", thẻ tóm tắt lớp + "Đổi lớp" (bước 1 chọn khoá, bước 2 chọn lớp/khai giảng).
   - Form data-hc-form="lead" (tư vấn nhanh ở trang chủ) gửi tại chỗ.
   - Gửi về Google Apps Script (HC_CONFIG.formUrl). Chưa có formUrl = chế độ xem thử.
   - Sự kiện window 'hc:form' {type:'open'|'submit'|'success'|'error', form, cls} để gắn đo lường. */
(function(){
  var CFG=window.HC_CONFIG||{}, D=window.HC_DATA||{};
  var INAPP=/FBAN|FBAV|FB_IAB|Instagram|Zalo|musical_ly|Bytedance|TikTok|Line\//i.test(navigator.userAgent||'');
  var LIVE=!!CFG.formUrl&&!/claude|localhost|^$/.test(location.hostname); // bản xem thử trên claude.ai không gửi được ra ngoài -> chế độ xem thử
  var A='#FFA406', INK='#1A1A1A', BG='#F5EFE3';
  var WD=['CN','T2','T3','T4','T5','T6','T7'];
  function emit(type,form,cls){try{window.dispatchEvent(new CustomEvent('hc:form',{detail:{type:type,form:form,cls:cls}}));}catch(e){}}
  function k(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.')+'K';}
  function p2(n){return (n<10?'0':'')+n;}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch];});}
  function today(){var t=new Date();return t.getFullYear()+'-'+p2(t.getMonth()+1)+'-'+p2(t.getDate());}
  function dshort(s){var d=new Date(s+'T00:00:00');return WD[d.getDay()]+' '+p2(d.getDate())+'/'+p2(d.getMonth()+1);}
  function dlong(s){var d=new Date(s+'T00:00:00');return WD[d.getDay()]+' '+p2(d.getDate())+'/'+p2(d.getMonth()+1)+'/'+d.getFullYear();}
  function left(x){return Math.max(0,(x.capacity||0)-(x.enrolled||0));}

  /* Khoá mở đăng ký và khoá chờ mở. Tên: tiếng Việt trước, tiếng Anh sau. */
  var REG=['dropin','improv1','improv2','performer1','performer2'], KID='kids';
  var WAIT={performer1:['Diễn viên Ứng tác 1','Performer 1'],performer2:['Diễn viên Ứng tác 2','Performer 2'],'teens-ensemble':['Đội diễn Thiếu niên','Teens Ensemble'],'house-team':['Đội ngũ High','House Team'],'improv-for-actors':['Ứng tác cho Diễn viên','Improv for Actors'],'long-form-harold':['Ứng tác Dài · The Harold','Long-form'],'community-jam':['Jam Cộng đồng','Community Jam'],'rainbow-jam':['Sân chơi Ứng tác LGBTQIA+','Rainbow Jam'],'improv-for-writers':['Ứng tác cho Biên kịch','Improv for Writers'],'improv-for-presenters':['Ứng tác cho MC/BTV','Improv for Presenters'],'improv-teacher-1-&-2':['Giảng viên Ứng tác','Improv Teacher']};
  function nm(cid){var c=D[cid];if(c&&c.vi)return [c.vi,c.en];return WAIT[cid]||[cid,''];}
  function full(cid){var n=nm(cid);return n[0]+(n[1]?' · '+n[1]:'');}
  function cohorts(cid){var c=D[cid];if(!c||!c.cohorts)return [];var t=today();return c.cohorts.filter(function(x){return x.start&&x.start>=t;}).sort(function(a,b){return a.start<b.start?-1:1;});}
  function bestCohort(cid){var cs=cohorts(cid);for(var i=0;i<cs.length;i++)if(left(cs[i])>0)return cs[i];return null;}
  function cohortById(cid,code){var cs=cohorts(cid);for(var i=0;i<cs.length;i++)if(cs[i].code===code)return cs[i];return null;}
  function priceHTML(cid){var c=D[cid]||{};return (c.sale?'<b>'+k(c.sale)+'</b>':'')+(c.base?' <s>'+k(c.base)+'</s>':'');}

  /* ---------- CSS ---------- */
  var css='.hcf-bd{position:fixed;inset:0;z-index:1000;background:rgba(26,26,26,0.55);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .2s}'
  +'.hcf-bd.on{opacity:1}'
  +'.hcf{background:'+BG+';color:'+INK+';width:100%;max-width:560px;max-height:calc(100vh - 40px);overflow:auto;border-radius:22px;border:2px solid '+INK+';box-shadow:8px 8px 0 '+A+';transform:translateY(16px);transition:transform .22s;font-family:"Be Vietnam Pro",system-ui,sans-serif;-webkit-overflow-scrolling:touch}'
  +'.hcf-bd.on .hcf{transform:none}'
  +'.hcf-h{position:sticky;top:0;background:'+BG+';padding:18px 22px 10px;display:flex;justify-content:space-between;gap:12px;align-items:flex-start;z-index:2}'
  +'.hcf-h small{display:block;font-size:11px;font-weight:700;letter-spacing:1px;color:#8A4B00}'
  +'.hcf-h b{display:block;font-family:"Bricolage Grotesque","Be Vietnam Pro",sans-serif;font-size:22px;line-height:1.15;letter-spacing:-0.02em;margin-top:4px}'
  +'.hcf-h em{display:block;font-style:normal;font-size:13px;font-weight:600;color:rgba(26,26,26,0.6);margin-top:2px}'
  +'.hcf-x{flex:0 0 40px;height:40px;border-radius:50%;border:1.5px solid '+INK+';background:#fff;cursor:pointer;font-size:20px;line-height:1;color:'+INK+'}'
  +'.hcf-x:hover{background:'+A+'}'
  +'.hcf form,.hcf .hcf-done{padding:4px 22px 22px;display:grid;grid-template-columns:1fr 1fr;gap:12px}'
  +'.hcf .full{grid-column:1/-1}.hcf [hidden]{display:none!important}'
  +'.hcf label{display:flex;flex-direction:column;gap:5px;font-size:13px;font-weight:600}'
  +'.hcf label i{font-style:normal;color:#B3261E}'
  +'.hcf input:not([type=checkbox]):not([type=radio]),.hcf select,.hcf textarea{height:46px;padding:0 12px;border:2px solid '+INK+';border-radius:12px;background:#fff;font:inherit;font-size:16px;font-weight:400;color:'+INK+';box-sizing:border-box;width:100%}'
  +'.hcf textarea{height:76px;padding:10px 12px;resize:vertical}'
  +'.hcf input:focus,.hcf select:focus,.hcf textarea:focus{outline:none;border-color:#8A4B00;box-shadow:0 0 0 3px rgba(255,164,6,0.45)}'
  +'.hcf .bad input,.hcf .bad select,.hcf .bad textarea{border-color:#B3261E}'
  +'.hcf .err{font-size:12px;font-weight:600;color:#B3261E}'
  +'.hcf .chk{flex-direction:row;align-items:flex-start;gap:8px;font-weight:500;line-height:1.5}'
  +'.hcf .chk input{width:20px;height:20px;margin:1px 0 0;accent-color:'+INK+';flex:0 0 20px}'
  +'.hcf .chk.bad{color:#B3261E}'
  +'.hcf .pol{margin:-6px 0 0 28px;font-size:13px;line-height:1.55;color:rgba(26,26,26,0.78)}'
  +'.hcf .pol summary{cursor:pointer;font-weight:600;color:#8A4B00;list-style:none;display:inline-flex;align-items:center;gap:4px;padding:2px 0}'
  +'.hcf .pol summary::-webkit-details-marker{display:none}'
  +'.hcf .pol summary::after{content:"▾";transition:transform .2s}.hcf .pol[open] summary::after{transform:rotate(180deg)}'
  +'.hcf .pol-b{margin-top:8px;background:#fff;border-radius:12px;padding:12px 14px}'
  +'.hcf .pol ul{margin:0;padding-left:18px}.hcf .pol li{margin:0 0 6px}.hcf .pol b{color:'+INK+'}'
  +'.hcf .pol a{font-weight:600;color:'+INK+'}'
  +'.hcf .chips{display:flex;flex-wrap:wrap;gap:6px}'
  +'.hcf .chips label{flex-direction:row;align-items:center;gap:6px;background:#fff;border:1.5px solid rgba(26,26,26,0.25);border-radius:100px;padding:6px 12px;font-weight:500;cursor:pointer}'
  +'.hcf .chips input{accent-color:'+INK+'}'
  +'.hcf .note{font-size:12px;line-height:1.55;color:rgba(26,26,26,0.65)}'
  +'.hcf .sum{background:#fff;border-radius:14px;padding:12px 14px;font-size:13px;line-height:1.7}'
  /* công tắc bản thân / cho con */
  +'.hcf .seg{display:grid;grid-template-columns:1fr 1fr;background:#fff;border:2px solid '+INK+';border-radius:100px;padding:3px;gap:3px}'
  +'.hcf .seg button{height:40px;border:0;border-radius:100px;background:transparent;font:inherit;font-size:14px;font-weight:700;color:rgba(26,26,26,0.65);cursor:pointer}'
  +'.hcf .seg button:hover{color:'+INK+'}.hcf .seg button[aria-pressed=true]{background:'+INK+';color:'+BG+'}'
  /* thẻ lớp đã chọn */
  +'.hcf .pick{background:#fff;border:2px solid '+INK+';border-radius:16px;padding:12px 14px}'
  +'.hcf .pick-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}'
  +'.hcf .pick-t{font-weight:800;font-size:15px;line-height:1.3}.hcf .pick-t span{display:block;font-weight:600;font-size:12px;color:rgba(26,26,26,0.55)}'
  +'.hcf .pick-m{font-size:13px;line-height:1.6;color:rgba(26,26,26,0.8);margin-top:6px}'
  +'.hcf .pick-p{display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-size:14px}.hcf .pick-p s{font-size:12px;color:rgba(26,26,26,0.45)}'
  +'.hcf .badge{font-size:12px;font-weight:700;background:'+A+';padding:3px 10px;border-radius:100px;white-space:nowrap}.hcf .badge.mut{background:'+BG+'}'
  +'.hcf .chg{border:0;background:none;font:inherit;font-size:13px;font-weight:700;color:#8A4B00;cursor:pointer;white-space:nowrap;padding:2px 0;text-decoration:underline;text-underline-offset:3px}'
  /* bộ chọn khoá + lớp */
  +'.hcf .pk{margin-top:10px;border-top:1px dashed rgba(26,26,26,0.25);padding-top:10px}'
  +'.hcf .pk-l{font-size:11px;font-weight:700;letter-spacing:1px;color:#8A4B00;margin:2px 0 6px}'
  +'.hcf .crs{display:flex;flex-direction:column;gap:6px}'
  +'.hcf .crs button{display:flex;justify-content:space-between;align-items:center;gap:10px;text-align:left;background:'+BG+';border:1.5px solid transparent;border-radius:12px;padding:9px 12px;font:inherit;color:'+INK+';cursor:pointer}'
  +'.hcf .crs button:hover{border-color:rgba(26,26,26,0.35)}.hcf .crs button[aria-pressed=true]{border-color:'+INK+';background:#FFF6E0}'
  +'.hcf .crs b{font-size:14px;display:block}.hcf .crs small{font-size:12px;color:rgba(26,26,26,0.55);font-weight:600}.hcf .crs .pr{font-size:13px;white-space:nowrap}.hcf .crs .pr s{font-size:11px;color:rgba(26,26,26,0.45)}'
  +'.hcf .coh{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;scrollbar-width:thin}'
  +'.hcf .coh button{flex:0 0 auto;display:flex;flex-direction:column;align-items:flex-start;gap:1px;background:#fff;border:1.5px solid rgba(26,26,26,0.3);border-radius:12px;padding:7px 12px;font:inherit;color:'+INK+';cursor:pointer;text-align:left}'
  +'.hcf .coh button b{font-size:13px}.hcf .coh button span{font-size:11px;color:rgba(26,26,26,0.6)}'
  +'.hcf .coh button:hover{border-color:'+INK+'}.hcf .coh button[aria-pressed=true]{border-color:'+INK+';background:'+A+'}'
  +'.hcf .coh button.out{opacity:.5;text-decoration:line-through}'
  +'.hcf .hcf-t{color:#AC1F01;font-weight:700}.hcf .coh button b{color:#AC1F01}.hcf .coh button[aria-pressed=true] b{color:'+INK+'}'
  +'.hcf-go{height:52px;border:0;border-radius:100px;background:'+INK+';color:'+BG+';font:inherit;font-weight:800;font-size:16px;cursor:pointer;transition:transform .12s,background .12s}'
  +'.hcf-go:hover{background:#000;transform:translateY(-1px)}.hcf-go:active{transform:translateY(1px)}'
  +'.hcf-go[disabled]{opacity:.6;cursor:wait;transform:none}'
  +'.hcf-alt{display:flex;align-items:center;justify-content:center;height:46px;border:1.5px solid '+INK+';border-radius:100px;font-weight:700;font-size:14px;text-decoration:none;color:'+INK+';box-sizing:border-box;background:transparent;font-family:inherit;cursor:pointer}'
  +'.hcf-alt:hover{background:'+A+'}'
  +'.hcf .hp{position:absolute!important;left:-9999px!important;width:1px;height:1px;overflow:hidden}'
  +'.hcf-spin{display:inline-block;width:16px;height:16px;border:2px solid rgba(245,239,227,.4);border-top-color:'+BG+';border-radius:50%;animation:hcfs .7s linear infinite;vertical-align:-3px;margin-right:8px}'
  +'@keyframes hcfs{to{transform:rotate(360deg)}}'
  +'.hcf .ok{width:56px;height:56px;flex:0 0 56px;border-radius:50%;background:'+A+';display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800}'
  +'.hcf .qr{display:flex;gap:12px;align-items:center}.hcf .qr img{width:96px;height:96px;border-radius:10px;background:#fff;padding:4px}'
  +'[data-hc-act]{cursor:pointer}'
  +'.hcf-cal{display:inline-block;margin-top:8px;font-size:13.5px;font-weight:700;color:#8A4B00;text-decoration:underline;text-underline-offset:3px}'
  +'.hcf-pay{display:flex;gap:16px;align-items:flex-start;background:#fff;border-radius:14px;padding:14px;border:2px solid #1A1A1A;box-shadow:4px 4px 0 #FFA406}.hcf-qrbox{display:flex;flex-direction:column;align-items:center;gap:6px;flex:0 0 auto}.hcf-qr{width:168px;height:168px;background:#F5EFE3;border-radius:8px}.hcf-qr img{display:block;width:168px;height:168px}.hcf-save{font-size:13px;font-weight:700;color:#8A4B00}.hcf-bank{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;font-size:14px}.hcf-bank dl{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;margin:6px 0;align-items:center}.hcf-bank dt{color:rgba(26,26,26,.6);font-size:13px}.hcf-bank dd{margin:0;word-break:break-word}.hcf-bank .hl{background:#FFE58F;padding:1px 6px;border-radius:4px}.hcf-bank button{font:inherit;font-size:12px;font-weight:700;border:1.5px solid #1A1A1A;background:#fff;border-radius:100px;padding:2px 10px;cursor:pointer;margin-left:4px}@media (max-width:640px){.hcf-pay{flex-direction:column;align-items:stretch}.hcf-qrbox{align-self:center}}'
  +'@media (max-width:640px){.hcf-bd{align-items:flex-end;padding:0}.hcf{max-width:none;max-height:92vh;border-radius:20px 20px 0 0;border-width:2px 0 0;box-shadow:none;transform:translateY(100%)}.hcf form,.hcf .hcf-done{grid-template-columns:1fr;padding-bottom:calc(22px + env(safe-area-inset-bottom,0px))}.hcf .qr img{display:none}.hcf-h{padding:14px 18px 8px}.hcf-h small{font-size:10px}.hcf-h b{font-size:19px;margin-top:3px}.hcf-h em{font-size:12px}.hcf-x{flex:0 0 34px;height:34px;font-size:17px;border-width:1px}.hcf form,.hcf .hcf-done{gap:14px 10px;padding:4px 18px 20px}.hcf label{font-size:12.5px;line-height:1.4;gap:6px}.hcf input:not([type=checkbox]):not([type=radio]),.hcf select{height:42px;border-width:1.5px;border-radius:10px;padding:0 12px}.hcf textarea{height:66px;border-width:1.5px;border-radius:10px}.hcf .seg{border-width:1.5px}.hcf .seg button{height:34px;font-size:12.5px}.hcf .pick{border-width:1.5px;border-radius:14px;padding:10px 12px}.hcf .pick-t{font-size:14px}.hcf .pick-m{font-size:12.5px;line-height:1.5;margin-top:4px}.hcf .pick-p{font-size:13px}.hcf .badge{font-size:11px;padding:2px 8px}.hcf .chg{font-size:12px}.hcf .note{font-size:11.5px}.hcf .chk{font-size:12.5px}.hcf .chk input{width:18px;height:18px;flex:0 0 18px}.hcf .chips label{font-size:12.5px;padding:5px 10px}.hcf-go{height:46px;font-size:15px}.hcf-alt{height:42px;font-size:13px}}'
  +'@media (prefers-reduced-motion:reduce){.hcf-bd,.hcf{transition:none}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  /* ---------- Trường dữ liệu ---------- */
  var SRC=['Facebook','TikTok','Bạn bè giới thiệu','Google','Báo chí','Khác'];
  function lab(t,req){return '<span>'+t+(req?' <i>*</i>':'')+'</span>';}
  function inp(name,label,o){o=o||{};var a=' name="'+name+'" maxlength="120"';
    if(o.type==='tel')a+=' inputmode="tel" autocomplete="tel" placeholder="09xx xxx xxx"';
    if(o.type==='email')a+=' inputmode="email" autocomplete="email"';
    if(o.auto)a+=' autocomplete="'+o.auto+'"'; if(o.ph)a+=' placeholder="'+esc(o.ph)+'"'; if(o.req)a+=' required';
    if(o.min!=null)a+=' inputmode="numeric" min="'+o.min+'" max="'+o.max+'"';
    return '<label class="'+(o.full?'full':'')+'"'+(o.grp?' data-grp="'+o.grp+'"':'')+'>'+lab(label,o.req)+'<input type="'+(o.type||'text')+'"'+a+'><span class="err"></span></label>';}
  function sel(name,label,opts,o){o=o||{};return '<label class="'+(o.full?'full':'')+'"'+(o.grp?' data-grp="'+o.grp+'"':'')+'>'+lab(label,o.req)+'<select name="'+name+'"'+(o.req?' required':'')+'><option value="">Chọn…</option>'+opts.map(function(x){return '<option>'+esc(x)+'</option>';}).join('')+'</select><span class="err"></span></label>';}
  function area(name,label,o){o=o||{};return '<label class="full"'+(o.grp?' data-grp="'+o.grp+'"':'')+'>'+lab(label)+'<textarea name="'+name+'" maxlength="1000"'+(o.ph?' placeholder="'+esc(o.ph)+'"':'')+'></textarea><span class="err"></span></label>';}
  function chk(name,label,o){o=o||{};return '<label class="chk full"'+(o.grp?' data-grp="'+o.grp+'"':'')+'><input type="checkbox" name="'+name+'" value="Có"'+(o.req?' required':'')+'>'+label+'</label>';}
  function chipset(name,label,opts){return '<div class="full"><div style="font-size:13px;font-weight:600;margin-bottom:6px">'+label+'</div><div class="chips">'+opts.map(function(x){return '<label><input type="checkbox" name="'+name+'" value="'+esc(x)+'">'+esc(x)+'</label>';}).join('')+'</div></div>';}

  /* ---------- Kiểm tra dữ liệu ---------- */
  var PHONE=/^(0|\+?84)(3|5|7|8|9)\d{8}$/, MAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function normPhone(v){return String(v||'').replace(/[\s.\-()]/g,'');}
  function isOff(el){var g=el.closest('[data-grp]');return g&&g.hidden;}
  function check(el){
    if(isOff(el))return true;
    var l=el.closest('label'), err=l&&l.querySelector('.err'), v=(el.value||'').trim(), m='';
    if(el.type==='checkbox'){if(el.required&&!el.checked){l.classList.add('bad');return false;}l&&l.classList.remove('bad');return true;}
    if(el.required&&!v) m='Vui lòng điền mục này.';
    else if(v&&el.type==='tel'&&!PHONE.test(normPhone(v))) m='Số điện thoại chưa đúng (10 số, bắt đầu bằng 0).';
    else if(v&&el.type==='email'&&!MAIL.test(v)) m='Email chưa đúng định dạng.';
    else if(v&&el.type==='number'&&(+v<+el.min||+v>+el.max)) m=el.name==='birth'?'Lớp nhận học viên từ 15 tuổi. Có con 8–14 tuổi? Chọn “Đăng ký cho con” ở trên.':'Lớp Kids dành cho bé 8–14 tuổi (sinh '+el.min+'–'+el.max+').';
    if(l)l.classList.toggle('bad',!!m); if(err)err.textContent=m; return !m;
  }
  function collect(form){
    var o={}, els=form.elements;
    for(var i=0;i<els.length;i++){var e=els[i];if(!e.name||isOff(e))continue;
      if(e.type==='checkbox'){if(e.checked)o[e.name]=o[e.name]?o[e.name]+'; '+e.value:e.value;}
      else o[e.name]=(e.value||'').trim().slice(0,1000);}
    if(o.phone)o.phone=normPhone(o.phone);
    return o;
  }

  /* ---------- Gửi ---------- */
  function send(payload){
    if(!LIVE) return new Promise(function(res){setTimeout(function(){res({ok:true,demo:true});},700);});
    return fetch(CFG.formUrl,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)}).then(function(r){return r.json();});
  }
  function throttled(){try{var t=JSON.parse(localStorage.getItem('hcf_t')||'[]'),now=Date.now();return t.filter(function(x){return now-x<3600e3;}).length>=5;}catch(e){return false;}}
  function mark(){try{var t=JSON.parse(localStorage.getItem('hcf_t')||'[]');t.push(Date.now());localStorage.setItem('hcf_t',JSON.stringify(t.slice(-10)));}catch(e){}}
  function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8);}

  /* ---------- Thẻ lớp + bộ chọn khoá/lớp ---------- */
  function cohortLine(cid,x){
    if(!x) return 'Lịch khai giảng sẽ thông báo · đăng ký trước để giữ chỗ';
    return (x.code?x.code+' · ':'')+'<span class="hcf-t">'+dlong(x.start)+(x.time?' · '+x.time:'')+'</span> · '+esc((D[cid]||{}).loc||'');
  }
  function pickerHTML(st){
    var cid=st.cid, x=st.code?cohortById(cid,st.code):null, list=st.mode==='kid'?[KID]:REG.filter(function(id){return id===cid||!D[id]||!D[id].cohorts||cohorts(id).length;}); // chỉ hiện khoá đang có lớp mở
    var top=cid?'<div class="pick-top"><div class="pick-t">'+esc(nm(cid)[0])+'<span>'+esc(nm(cid)[1])+'</span></div>'+((list.length>1||cohorts(cid).length>1)?'<button type="button" class="chg" data-pk-toggle aria-expanded="'+(st.open?'true':'false')+'">'+(st.open?'Thu gọn':'Đổi lớp')+' ›</button>':'')+'</div>'
      +'<div class="pick-m">'+cohortLine(cid,x)+'</div>'
      +'<div class="pick-p"><span>'+priceHTML(cid)+'</span>'+(x?'<span class="badge">'+(left(x)?'Còn '+left(x)+'/'+x.capacity+' chỗ':'Hết chỗ')+'</span>':'<span class="badge mut">Tối đa '+((D[cid]||{}).capacity||'')+' '+(cid===KID?'bé':'người')+'</span>')+'</div>'
      :'<div class="pick-t">Chọn khoá học</div>';
    var pk='';
    if(st.open||!cid){
      pk='<div class="pk">'+(list.length>1?'<div class="pk-l">BƯỚC 1 · CHỌN KHOÁ</div><div class="crs">'+list.map(function(id){var n=nm(id);return '<button type="button" data-crs="'+id+'" aria-pressed="'+(id===cid)+'"><span><b>'+esc(n[0])+'</b><small>'+esc(n[1])+'</small></span><span class="pr">'+priceHTML(id)+'</span></button>';}).join('')+'</div>':'');
      if(cid){var cs=cohorts(cid);
        pk+='<div class="pk-l" style="margin-top:10px">'+(list.length>1?'BƯỚC 2 · ':'')+'CHỌN LỚP</div>';
        pk+=cs.length?'<div class="coh">'+cs.map(function(c){var l=left(c);return '<button type="button" data-coh="'+esc(c.code)+'" aria-pressed="'+(c.code===st.code)+'"'+(l?'':' class="out"')+'><b>'+esc(c.code||'')+' · '+dshort(c.start)+'</b><span>'+esc(c.time||'')+' · '+(l?'còn '+l+' chỗ':'hết chỗ')+'</span></button>';}).join('')+'</div>'
          :'<div class="note">Chưa có lịch khai giảng. Gửi đăng ký để giữ chỗ, High Comedia sẽ báo lịch sớm nhất.</div>';
      }
      pk+='</div>';
    }
    return '<div class="pick">'+top+pk+'</div><input type="hidden" name="cls" value="'+esc(cid||'')+'"><input type="hidden" name="cohort" value="'+esc(st.code||'')+'"><span class="err" data-pk-err></span>';
  }

  /* ---------- Nội dung các form ---------- */
  function regBody(st){
    return '<div class="seg full" role="group" aria-label="Đăng ký cho ai"><button type="button" data-mode="self" aria-pressed="'+(st.mode!=='kid')+'">Cho bản thân</button><button type="button" data-mode="kid" aria-pressed="'+(st.mode==='kid')+'">Cho con 8–14 tuổi</button></div>'
      +'<div class="full" data-picker>'+pickerHTML(st)+'</div>'
      /* chung đầu */
      +'<label class="full" data-grp="self"'+(st.mode==='kid'?' hidden':'')+'>'+lab('Họ và tên',1)+'<input type="text" name="name" maxlength="120" autocomplete="name" required><span class="err"></span></label>'
      +'<label class="full" data-grp="kid"'+(st.mode!=='kid'?' hidden':'')+'>'+lab('Họ tên phụ huynh',1)+'<input type="text" name="parent" maxlength="120" autocomplete="name" required><span class="err"></span></label>'
      +inp('phone','Số điện thoại (Zalo)',{type:'tel',req:1})+inp('email','Email (nhận thông tin lớp)',{type:'email',req:1})
      /* riêng bản thân */
      +inp('birth','Năm sinh',{type:'number',req:1,min:1940,max:2011,ph:'VD: 1995',grp:'self'})
      +inp('friend','Đi cùng bạn bè? (tên, SĐT để nhận ưu đãi nhóm)',{full:1,grp:'self'})
      /* riêng cho con */
      +inp('child','Họ tên bé',{req:1,grp:'kid'})+inp('kbirth','Năm sinh của bé',{type:'number',req:1,min:2012,max:2018,ph:'8–14 tuổi',grp:'kid'})
      +inp('sibling','Anh chị em cùng học (tên, năm sinh)',{full:1,grp:'kid'})
      +inp('pickup','Người đưa đón (tên, SĐT)',{full:1,grp:'kid'})
      +area('health','Lưu ý sức khoẻ, dị ứng (nếu có)',{grp:'kid'})
      +chk('photo','Đồng ý cho High Comedia chụp ảnh con trong lớp để gửi riêng cho phụ huynh và dùng trên kênh của High Comedia',{grp:'kid'})
      +sel('source','Bạn biết High Comedia qua',SRC,{full:1})
      +area('note','Ghi chú',{ph:'Kinh nghiệm, mong muốn, câu hỏi…'})
      +chk('agree','Tôi đã đọc quy định lớp học, chính sách học bù và hoàn phí.',{req:1})
      +'<details class="pol full" data-pol><summary>Xem tóm tắt quy định</summary><div class="pol-b">'+polHTML(st.cid)+'</div></details>';
  }
  /* Tóm tắt chính sách ngay trong form (bản đầy đủ: /chinh-sach) */
  function polHTML(cid){
    var dep=k((D.site||{}).deposit||CFG.deposit||1000), li=function(a){return '<ul>'+a.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';};
    var body=cid==='dropin'?li(['<b>Thanh toán:</b> đủ phí khi đăng ký.','<b>Đổi buổi / hoàn phí:</b> báo trước 24 giờ được chuyển sang buổi sau hoặc hoàn 100%. Báo muộn hơn không hoàn.','<b>Học tiếp:</b> đăng ký Ứng tác Cơ bản trong 30 ngày được trừ 250K.'])
      :li(['<b>Giữ chỗ:</b> cọc '+dep+', đóng phần còn lại trước buổi 1.','<b>Học bù:</b> vắng có báo trước 24 giờ được học bù ở lớp sau hoặc nhận video, tài liệu buổi đó.','<b>Huỷ:</b> trước khai giảng 7 ngày hoàn 100%. Trong 7 ngày cuối hoàn 50% hoặc bảo lưu sang khoá sau. Sau buổi 1 không hoàn, được bảo lưu một lần trong 6 tháng. Sau buổi 3 không hoàn, không bảo lưu.']);
    return body+li(['<b>Trong lớp:</b> tôn trọng nhau, không phán xét. Không muốn lên ảnh, video thì báo giảng viên.'])+'<a href="/chinh-sach" target="_blank" rel="noopener">Đọc đầy đủ ↗</a>';
  }
  function waitBody(cid){
    var ids=(cid&&!WAIT[cid]&&D[cid]?[cid]:[]).concat(Object.keys(WAIT)); // khoá thường chưa mở lớp cũng vào danh sách chờ
    return '<label class="full">'+lab('Khoá quan tâm',1)+'<select name="cls" required>'+ids.map(function(id){return '<option value="'+esc(id)+'"'+(id===cid?' selected':'')+'>'+esc(full(id))+'</option>';}).join('')+'</select><span class="err"></span></label>'
      +inp('name','Họ và tên',{req:1,full:1,auto:'name'})+inp('phone','Số điện thoại (Zalo)',{type:'tel',req:1})+inp('email','Email (nhận tin khi mở lớp)',{type:'email',req:1})
      +area('note','Bạn đã học ứng tác ở đâu? Mong muốn gì?');
  }
  function quoteBody(){
    return inp('company','Tên công ty / tổ chức',{req:1,full:1,auto:'organization'})+inp('name','Người liên hệ',{req:1,auto:'name'})+inp('role','Chức vụ',{auto:'organization-title'})
      +inp('phone','Số điện thoại (Zalo)',{type:'tel',req:1})+inp('email','Email công việc',{type:'email',req:1})
      +sel('size','Số người tham gia',['6–10 người','11–20 người','Trên 20 người','Chưa rõ'],{req:1})+sel('when','Thời gian mong muốn',['Quý 3/2027','Quý 4/2027','Năm 2028','Chưa xác định'])
      +chipset('goals','Mục tiêu chính',['Giao tiếp & lắng nghe','Gắn kết đội nhóm','Sáng tạo & thích ứng','Thuyết trình tự tin','Lãnh đạo & phản hồi'])
      +area('note','Bối cảnh đội ngũ, mong muốn khác');
  }

  /* ---------- Mã QR chuyển khoản (VietQR · Napas 247), tạo ngay trên máy khách ---------- */
  function vietQR(amountK,info){
    var b=CFG.bank||{}, f=function(id,v){v=String(v);return id+('0'+v.length).slice(-2)+v;};
    var s=f('00','01')+f('01','12')+f('38',f('00','A000000727')+f('01',f('00',b.bin)+f('01',b.acct))+f('02','QRIBFTTA'))
      +f('53','704')+f('54',Math.round(amountK*1000))+f('58','VN')+(info?f('62',f('08',info)):'')+'6304', c=0xFFFF;
    for(var i=0;i<s.length;i++){c^=s.charCodeAt(i)<<8;for(var j=0;j<8;j++)c=(c&0x8000)?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF;}
    return s+('000'+c.toString(16).toUpperCase()).slice(-4);
  }
  function drawQR(root){
    var box=root&&root.querySelector('[data-pay]'); if(!box)return;
    function go(){try{var q=qrcode(0,'M');q.addData(box.getAttribute('data-pay'));q.make();var u=q.createDataURL(6,3);
      box.querySelector('.hcf-qr').innerHTML='<img src="'+u+'" alt="Mã QR chuyển khoản" width="168" height="168">';var a=box.querySelector('.hcf-save');if(INAPP){a.removeAttribute('download');a.removeAttribute('href');a.textContent='Nhấn giữ mã để lưu ảnh';a.style.cursor='default';}else a.href=u;a.hidden=false;}catch(e){}}
    if(window.qrcode)return go();
    var s=document.createElement('script');s.src='/qr.js?v=ec9f8b65';s.onload=go;document.head.appendChild(s);
  }
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-copy]');if(!b)return;
    var v=b.getAttribute('data-copy'),ok=function(){var t=b.textContent;b.textContent='Đã chép ✓';setTimeout(function(){b.textContent=t;},1500);};
    var fb=function(){var i=document.createElement('textarea');i.value=v;i.setAttribute('readonly','');i.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.appendChild(i);i.select();i.setSelectionRange(0,99);try{if(document.execCommand('copy'))ok();}catch(x){}document.body.removeChild(i);};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(v).then(ok,fb);else fb();});

  /* ---------- Màn hình sau khi gửi ---------- */
  function calUrl(cid,x){
    var c=D[cid]||{}, m=String(x.time||'9:00–11:00').match(/(\d{1,2})[:h](\d{2})?\D+(\d{1,2})[:h](\d{2})?/);
    var at=function(h,mi){var d=new Date(x.start+'T'+('0'+h).slice(-2)+':'+(mi||'00')+':00+07:00');return d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');};
    var dt=m?at(m[1],m[2])+'/'+at(m[3],m[4]):x.start.replace(/-/g,'')+'/'+x.start.replace(/-/g,'');
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent('High Comedia · '+full(cid)+(x.code?' · '+x.code:'')+' · Buổi 1')
      +'&dates='+dt+'&location='+encodeURIComponent(c.loc||'Hà Nội')+'&details='+encodeURIComponent('Có mặt trước 10 phút. Hỏi đáp: Zalo '+(CFG.phoneDisplay||'')+'\n'+location.origin+'/'+String(c.page||'khoa-hoc').replace(/\.html$/,''));
  }
  function doneHTML(kind,data,res){
    var z=CFG.zalo||'#', pay='', cid=data.cls, x=cid&&data.cohort?cohortById(cid,data.cohort):null;
    var bank=CFG.bank||{}, hasBank=bank.acct&&bank.bank&&bank.bin;
    if((kind==='reg'&&cid)||(kind==='kids'&&x)){
      var drop=cid==='dropin', amtK=drop?((D.dropin||{}).sale||150):((D.site||{}).deposit||CFG.deposit||1000), amt=k(amtK), info=normPhone(data.phone);
      pay='<div class="sum full"><b>Bước tiếp theo · giữ chỗ</b><br>'+(drop?'Thanh toán '+amt+' để giữ chỗ buổi Drop-in.':'Đặt cọc '+amt+' để giữ chỗ, phần còn lại thanh toán trước buổi 1.')
        +(hasBank?' Bạn có thể <b>chuyển khoản ngay</b> bằng mã QR dưới đây, hoặc chờ High Comedia nhắn Zalo hướng dẫn.'
          :'<br>High Comedia sẽ nhắn Zalo thông tin chuyển khoản cho bạn trong 24 giờ.')+'</div>'
        +(hasBank?'<div class="full hcf-pay" data-pay="'+esc(vietQR(amtK,info))+'"><div class="hcf-qrbox"><div class="hcf-qr" aria-label="Mã QR chuyển khoản"></div><a class="hcf-save" download="ma-qr-high-comedia.gif" hidden>Lưu mã QR</a></div>'
          +'<div class="hcf-bank"><b>Quét mã bằng app ngân hàng</b><span class="note">Số tiền và nội dung đã điền sẵn.</span>'
          +'<dl><dt>Ngân hàng</dt><dd>'+esc(bank.bank)+'</dd><dt>Số tài khoản</dt><dd><b>'+esc(bank.acct)+'</b> <button type="button" data-copy="'+esc(bank.acct)+'">Sao chép</button></dd>'
          +'<dt>Chủ tài khoản</dt><dd>'+esc(bank.holder||'')+'</dd><dt>Số tiền</dt><dd><b>'+String(amtK*1000).replace(/\B(?=(\d{3})+(?!\d))/g,'.')+' đ</b></dd>'
          +'<dt>Nội dung</dt><dd><b class="hl">'+esc(info)+'</b> <button type="button" data-copy="'+esc(info)+'">Sao chép</button></dd></dl>'
          +'<span class="note">Đã chuyển khoản? Bạn không cần làm gì thêm, High Comedia sẽ kiểm tra và gửi email <b>xác nhận giữ chỗ</b>.</span></div></div>':'');
    }
    var head={reg:'Đã nhận đăng ký!',kids:'Đã nhận đăng ký cho con!',waitlist:'Bạn đã có tên trong danh sách chờ!',quote:'Đã nhận yêu cầu tư vấn!'}[kind];
    var sub={reg:'High Comedia sẽ gọi hoặc nhắn Zalo cho bạn trong 24 giờ để xác nhận chỗ.',kids:'High Comedia sẽ liên hệ phụ huynh trong 24 giờ để xác nhận lịch học của con.',waitlist:'Bạn sẽ là người đầu tiên được báo khi lớp mở, kèm ưu đãi cho danh sách chờ.',quote:'Đạo diễn Đào Ngọc Hà sẽ liên hệ trong 1–2 ngày làm việc để đặt lịch buổi tư vấn.'}[kind];
    return '<div class="hcf-done" role="status">'
      +'<div class="full" style="display:flex;gap:14px;align-items:center"><div class="ok" aria-hidden="true">✓</div><div><b style="font-family:\'Bricolage Grotesque\',sans-serif;font-size:22px;display:block">'+head+'</b><span style="font-size:14px;color:rgba(26,26,26,0.75)">'+sub+'</span></div></div>'
      +(cid&&kind!=='quote'?'<div class="sum full"><b>'+esc(full(cid))+'</b>'+(kind!=='waitlist'?'<br>'+cohortLine(cid,x):'')+(x&&x.start&&(kind==='reg'||kind==='kids')?'<br><a class="hcf-cal" href="'+esc(calUrl(cid,x))+'" target="_blank" rel="noopener">📅 Lưu ngày học vào Google Calendar</a>':'')+'</div>':'')+pay
      +'<div class="full qr">'+(CFG.zaloQr?'<img src="'+esc(CFG.zaloQr)+'" alt="Mã QR Zalo High Comedia">':'')+'<div style="flex:1;display:flex;flex-direction:column;gap:8px"><span class="note">Cần hỏi ngay? Nhắn Zalo cho High Comedia.</span><a class="hcf-alt" href="'+esc(z)+'" target="_blank" rel="noopener">Nhắn Zalo '+esc(CFG.phoneDisplay||'')+'</a></div></div>'
      +(res&&res.demo?'<div class="note full" style="color:#8A4B00">Chế độ xem thử: dữ liệu chưa được gửi đi (chưa kết nối Google Sheet).</div>':'')
      +'<button type="button" class="hcf-go full" data-hcf-close>Đóng</button></div>';
  }
  function failHTML(){return '<div class="hcf-done"><div class="full"><b style="font-size:18px">Chưa gửi được</b><p class="note" style="font-size:14px">Mạng chập chờn hoặc hệ thống đang bận. Bạn thử lại, hoặc nhắn Zalo để giữ chỗ ngay.</p></div><button type="button" class="hcf-go" data-hcf-retry>Thử lại</button><a class="hcf-alt" href="'+esc(CFG.zalo||'#')+'" target="_blank" rel="noopener">Nhắn Zalo</a></div>';}

  /* ---------- Hộp đăng ký (modal) ---------- */
  var bd=null, lastFocus=null, opened=0, ST=null;
  function close(){
    if(!bd)return; var b=bd; bd=null; ST=null; b.classList.remove('on'); document.documentElement.style.overflow='';
    setTimeout(function(){b.remove();},220); if(lastFocus&&lastFocus.focus)lastFocus.focus();
  }
  function setTitle(){
    if(!bd||!ST)return; var t=bd.querySelector('#hcf-t'), s=bd.querySelector('#hcf-s'), kk=bd.querySelector('#hcf-k');
    if(ST.kind==='reg'){kk.textContent=ST.mode==='kid'?'ĐĂNG KÝ CHO CON':'ĐĂNG KÝ HỌC';var n=ST.cid?nm(ST.cid):['Chọn khoá học',''];t.textContent=n[0];s.textContent=n[1];}
  }
  function renderPicker(){var p=bd.querySelector('[data-picker]');p.innerHTML=pickerHTML(ST);var q=bd.querySelector('[data-pol] .pol-b');if(q)q.innerHTML=polHTML(ST.cid);setTitle();}
  function setMode(mode){
    ST.mode=mode; var f=bd.querySelector('form');
    var g=f.querySelectorAll('[data-grp]');for(var i=0;i<g.length;i++)g[i].hidden=g[i].getAttribute('data-grp')!==mode;
    var b=f.querySelectorAll('[data-mode]');for(var j=0;j<b.length;j++)b[j].setAttribute('aria-pressed',b[j].getAttribute('data-mode')===mode);
    if(mode==='kid'&&ST.cid!==KID){ST.lastSelf=[ST.cid,ST.code];ST.cid=KID;ST.code=(bestCohort(KID)||{}).code||'';ST.open=false;}
    if(mode==='self'&&ST.cid===KID){var ls=ST.lastSelf||['',''];ST.cid=ls[0];ST.code=ls[1];ST.open=!ST.cid;}
    renderPicker();
  }
  function open(act,trigger){
    var parts=act.split(':'), kind=parts[0], cid=parts[1]||'', pick=parts[2]||''; // reg:khoa:malop = chọn sẵn lớp
    if(kind==='reg'&&cid&&cid!==KID&&D[cid]&&D[cid].cohorts&&!bestCohort(cid)){kind='waitlist';} // khoá hết chỗ hoặc chưa mở lớp nào -> danh sách chờ
    if(['reg','waitlist','quote'].indexOf(kind)<0) return;
    lastFocus=trigger; opened=Date.now();
    ST={kind:kind,mode:cid===KID?'kid':'self',cid:(kind==='reg'&&(REG.indexOf(cid)>=0||cid===KID))?cid:'',code:'',open:false};
    if(ST.cid){var pc=pick&&cohortById(ST.cid,pick);ST.code=(pc&&left(pc)?pc:bestCohort(ST.cid)||{}).code||'';}
    var head=kind==='quote'?['ỨNG TÁC CHO DOANH NGHIỆP','Nhận tư vấn & báo giá','']:kind==='waitlist'?['BÁO TÔI KHI MỞ LỚP',nm(cid)[0]||'Nhận tin khi mở lớp',nm(cid)[1]||'']:['ĐĂNG KÝ HỌC','',''];
    var body=kind==='reg'?regBody(ST):kind==='waitlist'?waitBody(cid):quoteBody();
    var btn={reg:'Gửi đăng ký',waitlist:'Đăng ký nhận tin',quote:'Gửi yêu cầu tư vấn'}[kind];
    bd=document.createElement('div'); bd.className='hcf-bd';
    bd.innerHTML='<div class="hcf" role="dialog" aria-modal="true" aria-labelledby="hcf-t"><div class="hcf-h"><div><small id="hcf-k">'+head[0]+'</small><b id="hcf-t">'+esc(head[1])+'</b><em id="hcf-s">'+esc(head[2])+'</em></div><button type="button" class="hcf-x" aria-label="Đóng" data-hcf-close>×</button></div>'
      +'<form novalidate>'+body
      +'<label class="hp" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>'
      +'<span class="note full">Thông tin chỉ dùng để High Comedia liên hệ với bạn, không chia sẻ cho bên thứ ba.</span>'
      +'<button type="submit" class="hcf-go full">'+btn+'</button></form></div>';
    document.body.appendChild(bd); document.documentElement.style.overflow='hidden';
    if(kind==='reg'){if(!ST.cid)ST.open=true;setMode(ST.mode);}
    requestAnimationFrame(function(){bd&&bd.classList.add('on');});
    var form=bd.querySelector('form'); bind(form,bd.querySelector('.hcf'));
    var first=form.querySelector('[data-grp="'+ST.mode+'"] input, input[name=company], select[name=cls], input[name=name]');
    setTimeout(function(){first&&first.focus({preventScroll:true});},60);
    emit('open',kind,cid);
  }
  function bind(form,box){
    form.addEventListener('click',function(e){
      var m=e.target.closest('[data-mode]'); if(m){setMode(m.getAttribute('data-mode'));return;}
      if(e.target.closest('[data-pk-toggle]')){ST.open=!ST.open;renderPicker();return;}
      var c=e.target.closest('[data-crs]'); if(c){var id=c.getAttribute('data-crs');ST.cid=id;ST.code=(bestCohort(id)||{}).code||'';ST.open=cohorts(id).length>1;renderPicker();return;}
      var h=e.target.closest('[data-coh]'); if(h){var code=h.getAttribute('data-coh'),x=cohortById(ST.cid,code);
        if(x&&!left(x)){var n=bd.querySelector('[data-pk-err]');n.innerHTML='Lớp '+esc(code)+' đã hết chỗ. Chọn lớp khác, hoặc <a href="#" data-hc-act="waitlist:'+esc(ST.cid)+'">báo tôi khi có chỗ</a>.';return;}
        ST.code=code;ST.open=false;renderPicker();}
    });
    form.addEventListener('blur',function(e){var el=e.target;if(!el.matches('input,select,textarea'))return;var l=el.closest('label');if((el.value||'').trim()||(l&&l.classList.contains('bad')))check(el);},true);
    form.addEventListener('input',function(e){var l=e.target.closest('label');if(l&&l.classList.contains('bad'))check(e.target);});
    form.addEventListener('change',function(e){if(e.target.type==='checkbox')check(e.target);});
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var ok=true, firstBad=null, els=form.querySelectorAll('input:not([type=hidden]):not([name=website]),select,textarea');
      for(var i=0;i<els.length;i++){if(!check(els[i])){ok=false;firstBad=firstBad||els[i];}}
      if(ST.kind==='reg'&&!ST.cid){ok=false;var pe=bd.querySelector('[data-pk-err]');pe.textContent='Vui lòng chọn khoá học.';firstBad=firstBad||bd.querySelector('[data-crs]');}
      if(!ok){firstBad&&firstBad.focus();return;}
      var data=collect(form), kind=ST.kind==='reg'&&ST.mode==='kid'?'kids':ST.kind;
      if(kind==='kids'){data.birth=data.kbirth;delete data.kbirth;}
      if(data.website||Date.now()-opened<2500){showDone(box,kind,data,{ok:true});return;} // bot: giả vờ thành công
      if(throttled()){form.outerHTML=failHTML();return;}
      var btn=form.querySelector('.hcf-go'), txt=btn.textContent; btn.disabled=true; btn.innerHTML='<span class="hcf-spin"></span>Đang gửi…';
      delete data.website;
      var payload={form:kind,cls:data.cls||'',cohort:data.cohort||'',clsName:data.cls?full(data.cls)+(data.cohort?' · '+data.cohort:''):'',data:data,page:location.pathname,ref:document.referrer.slice(0,200),id:uid(),t:Date.now()-opened};
      emit('submit',kind,payload.cls);
      send(payload).then(function(res){
        if(!res||!res.ok) throw new Error(res&&res.error||'fail');
        mark(); showDone(box,kind,data,res); emit('success',kind,payload.cls);
      }).catch(function(){
        btn.disabled=false; btn.textContent=txt; emit('error',kind,payload.cls);
        var w=document.createElement('div'); w.innerHTML=failHTML(); var fail=w.firstChild; form.parentNode.replaceChild(fail,form);
        fail.querySelector('[data-hcf-retry]').onclick=function(){fail.parentNode.replaceChild(form,fail);};
      });
    });
  }
  function showDone(box,kind,data,res){var f=box.querySelector('form')||box.querySelector('.hcf-done');var w=document.createElement('div');w.innerHTML=doneHTML(kind,data,res);var nd=w.firstChild;f.parentNode.replaceChild(nd,f);box.scrollTop=0;drawQR(nd);}

  /* ---------- Sự kiện chung ---------- */
  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('[data-hc-act]');
    if(t){e.preventDefault();var act=t.getAttribute('data-hc-act');if(bd){var tr=lastFocus;close();setTimeout(function(){open(act,tr);},230);}else open(act,t);return;}
    if(bd&&(e.target===bd||e.target.closest('[data-hcf-close]')))close();
  });
  document.addEventListener('keydown',function(e){
    if(!bd)return;
    if(e.key==='Escape')close();
    if(e.key==='Tab'){var f=[].filter.call(bd.querySelectorAll('button,a[href],input:not([tabindex="-1"]):not([type=hidden]),select,textarea'),function(x){return x.offsetParent!==null;});if(!f.length)return;var a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}
  });

  /* ---------- Form tư vấn nhanh tại chỗ (trang chủ) ---------- */
  function lead(form){
    var t0=Date.now();
    var hp=document.createElement('input');hp.type='text';hp.name='website';hp.tabIndex=-1;hp.autocomplete='off';hp.setAttribute('aria-hidden','true');hp.style.cssText='position:absolute;left:-9999px;width:1px;height:1px';form.appendChild(hp);
    var btn=form.querySelector('button'); btn.type='submit'; form.setAttribute('novalidate','');
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var name=form.querySelector('[name=name]'),phone=form.querySelector('[name=phone]'),mail=form.querySelector('[name=email]'),ok=true;
      [name,phone,mail].filter(Boolean).forEach(function(el){var v=(el.value||'').trim(),bad=!v||(el===phone&&!PHONE.test(normPhone(v)))||(el===mail&&!MAIL.test(v));el.style.outline=bad?'3px solid #B3261E':'';if(bad&&ok){ok=false;el.focus();}});
      if(!ok)return;
      var data=collect(form); if(data.website||Date.now()-t0<2500){done();return;}
      var txt=btn.textContent;btn.disabled=true;btn.textContent='Đang gửi…';
      var so=form.querySelector('[name=cls]'),sot=so&&so.selectedIndex>=0?so.options[so.selectedIndex].text:'';
      send({form:'lead',cls:data.cls||'',clsName:sot,data:data,page:location.pathname,id:uid()}).then(function(r){if(!r||!r.ok)throw 0;mark();done(r);emit('success','lead',data.cls);})
        .catch(function(){btn.disabled=false;btn.textContent=txt;var m=form.querySelector('.hcf-msg')||document.createElement('div');m.className='hcf-msg';m.style.cssText='grid-column:1/-1;font-size:13px;font-weight:600;color:#B3261E';m.innerHTML='Chưa gửi được. Thử lại hoặc <a href="'+esc(CFG.zalo||'#')+'">nhắn Zalo</a>.';form.appendChild(m);});
      function done(r){form.innerHTML='<div style="grid-column:1/-1;padding:8px 4px"><div style="font-size:28px">✓</div><b style="font-size:20px;display:block;margin:4px 0">Đã nhận thông tin!</b><span style="font-size:14px;opacity:.8">High Comedia gọi lại trong 24 giờ. Cần gấp? <a href="'+esc(CFG.zalo||'#')+'" style="font-weight:700">Nhắn Zalo</a>.</span>'+(r&&r.demo?'<div style="font-size:12px;margin-top:8px;color:#8A4B00">Chế độ xem thử: chưa gửi đi.</div>':'')+'</div>';}
    });
  }
  function init(){var fs=document.querySelectorAll('form[data-hc-form="lead"]');for(var i=0;i<fs.length;i++)lead(fs[i]);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

  /* Sĩ số, lịch lớp: hc.js tải dữ liệu sống từ Google Sheet vào HC_DATA; form đọc trực tiếp HC_DATA nên luôn mới. */
  window.HC_openForm=open;
})();
