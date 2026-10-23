if (!sessionStorage.getItem('mediqAdmin')) window.location.replace('index.html');

const initialDoctors = [
  {id:'d1',name:'Dr. Leyla Həsənova',specialty:'Terapevt'},
  {id:'d2',name:'Dr. Murad Əliyev',specialty:'Kardioloq'},
  {id:'d3',name:'Dr. Nigar Rzayeva',specialty:'Pediatr'},
  {id:'d4',name:'Dr. Elvin Quliyev',specialty:'Dermatoloq'}
];
const isoOffset = (days) => { const date = new Date(); date.setDate(date.getDate()+days); return date.toISOString().slice(0,10); };
const initialAppointments = [
  {id:'a1',name:'Aysel Məmmədova',phone:'+994 50 111 22 33',doctorId:'d1',date:isoOffset(1),time:'10:30',status:'Təsdiqlənib'},
  {id:'a2',name:'Kamal Əliyev',phone:'+994 55 222 33 44',doctorId:'d2',date:isoOffset(2),time:'12:00',status:'Gözləyir'},
  {id:'a3',name:'Lalə Qasımova',phone:'+994 70 333 44 55',doctorId:'d3',date:isoOffset(3),time:'14:00',status:'Gözləyir'}
];
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
let doctors = read('mediq2_doctors', initialDoctors);
let appointments = read('mediq2_appointments', initialAppointments);
const times = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','14:00','14:30','15:00','15:30','16:00'];
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const doctorById = (id) => doctors.find((doctor) => doctor.id === id) || {name:'Həkim silinib',specialty:''};
const formatDate = (date) => new Intl.DateTimeFormat('az-AZ',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(date+'T12:00:00'));
const save = () => { localStorage.setItem('mediq2_doctors',JSON.stringify(doctors)); localStorage.setItem('mediq2_appointments',JSON.stringify(appointments)); render(); };
const statusClass = (status) => status==='Təsdiqlənib'?'confirmed':status==='Ləğv edilib'?'cancelled':'';
const statusBadge = (status) => `<span class="status ${statusClass(status)}">${status}</span>`;
function toast(message){const box=$('#toast');box.textContent=message;box.classList.add('show');setTimeout(()=>box.classList.remove('show'),2400);}

function setSection(name){
  document.querySelectorAll('.page-section').forEach(section=>section.classList.toggle('active',section.id===`section-${name}`));
  document.querySelectorAll('[data-section]').forEach(button=>button.classList.toggle('selected',button.dataset.section===name));
  window.scrollTo({top:0,behavior:'smooth'});
}
document.querySelectorAll('[data-section]').forEach(button=>button.addEventListener('click',()=>setSection(button.dataset.section)));
document.querySelectorAll('[data-jump]').forEach(button=>button.addEventListener('click',()=>setSection(button.dataset.jump)));

function table(headers, rows){
  if(!rows.length)return '<div class="empty-state">Hələ məlumat yoxdur.</div>';
  return `<table><thead><tr>${headers.map(header=>`<th>${header}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
}
function render(){
  const active=appointments.filter(item=>item.status!=='Ləğv edilib');
  const uniquePatients=new Map();appointments.forEach(item=>uniquePatients.set(item.phone,item));
  const today=new Date().toISOString().slice(0,10);
  $('#patient-count').textContent=uniquePatients.size;
  $('#appointment-count').textContent=active.length;
  $('#doctor-count').textContent=doctors.length;
  $('#today-count').textContent=appointments.filter(item=>item.date===today&&item.status!=='Ləğv edilib').length;
  const sorted=appointments.slice().sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
  const appointmentRows=sorted.map(item=>`<tr><td><strong>${escapeHtml(item.name)}</strong><br>${escapeHtml(item.phone)}</td><td>${escapeHtml(doctorById(item.doctorId).name)}</td><td>${formatDate(item.date)} · ${item.time}</td><td>${statusBadge(item.status)}</td></tr>`);
  $('#recent-table').innerHTML=table(['Pasiyent','Həkim','Tarix və saat','Status'],appointmentRows.slice(0,4));
  const patients=[...uniquePatients.values()].map((item,index)=>`<tr><td>${index+1}</td><td><strong>${escapeHtml(item.name)}</strong></td><td>${escapeHtml(item.phone)}</td><td>${appointments.filter(a=>a.phone===item.phone&&a.status!=='Ləğv edilib').length}</td><td>${formatDate(item.date)}</td></tr>`);
  $('#patients-table').innerHTML=table(['№','Pasiyent','Telefon','Aktiv növbə','Son qeydiyyat'],patients);
  $('#appointment-total').textContent=appointments.length+' qeyd';
  const fullRows=sorted.map(item=>`<tr><td><strong>${escapeHtml(item.name)}</strong><br>${escapeHtml(item.phone)}</td><td>${escapeHtml(doctorById(item.doctorId).name)}</td><td>${formatDate(item.date)} · ${item.time}</td><td>${statusBadge(item.status)}</td><td>${item.status==='Gözləyir'?`<button class="table-action" data-approve="${item.id}">Təsdiqlə</button>`:''}${item.status!=='Ləğv edilib'?`<button class="table-action cancel" data-cancel="${item.id}">Ləğv et</button>`:'—'}</td></tr>`);
  $('#appointments-table').innerHTML=table(['Pasiyent','Həkim','Tarix və saat','Status','Əməliyyat'],fullRows);
  document.querySelectorAll('[data-approve]').forEach(button=>button.onclick=()=>{const item=appointments.find(a=>a.id===button.dataset.approve);item.status='Təsdiqlənib';save();toast('Növbə təsdiqləndi.');});
  document.querySelectorAll('[data-cancel]').forEach(button=>button.onclick=()=>{const item=appointments.find(a=>a.id===button.dataset.cancel);item.status='Ləğv edilib';save();toast('Demo növbəsi ləğv edildi.');});
  $('#doctor-select').innerHTML='<option value="">Həkim seçin</option>'+doctors.map(d=>`<option value="${d.id}">${escapeHtml(d.name)} — ${escapeHtml(d.specialty)}</option>`).join('');
  $('#doctors-grid').innerHTML=doctors.map(d=>`<article class="doctor-card"><div class="doctor-initial">${d.name.split(' ').filter(Boolean).slice(-2).map(x=>x[0]).join('').toUpperCase()}</div><h3>${escapeHtml(d.name)}</h3><p>${escapeHtml(d.specialty)}</p></article>`).join('')||'<div class="empty-state">Həkim əlavə olunmayıb.</div>';
  const weekdays=['Bazar ertəsi','Çərşənbə axşamı','Çərşənbə','Cümə axşamı','Cümə'];
  const scheduleRows=doctors.flatMap(d=>weekdays.map(day=>`<tr><td><strong>${escapeHtml(d.name)}</strong></td><td>${day}</td><td>09:00–13:00</td><td>14:00–17:00</td><td><span class="status confirmed">Qəbul var</span></td></tr>`));
  $('#schedule-table').innerHTML=table(['Həkim','Həftənin günü','Səhər','Günortadan sonra','Status'],scheduleRows);
}

$('#appointment-date').min=isoOffset(0);$('#appointment-date').value=isoOffset(1);
$('#appointment-time').innerHTML='<option value="">Saat seçin</option>'+times.map(time=>`<option value="${time}">${time}</option>`).join('');
$('#appointment-form').addEventListener('submit',(event)=>{
  event.preventDefault();
  const item={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name:$('#p-name').value.trim(),phone:$('#p-phone').value.trim(),doctorId:$('#doctor-select').value,date:$('#appointment-date').value,time:$('#appointment-time').value,status:'Gözləyir'};
  if(appointments.some(a=>a.doctorId===item.doctorId&&a.date===item.date&&a.time===item.time&&a.status!=='Ləğv edilib')){toast('Bu həkimin həmin saatı tutulub.');return;}
  appointments.push(item);save();event.target.reset();$('#appointment-date').value=isoOffset(1);toast('Yeni növbə yaradıldı.');
});
$('#doctor-form').addEventListener('submit',(event)=>{
  event.preventDefault();
  doctors.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name:$('#doctor-name').value.trim(),specialty:$('#doctor-specialty').value.trim()});
  save();event.target.reset();toast('Həkim siyahıya əlavə edildi.');
});
$('#logout').addEventListener('click',()=>{sessionStorage.removeItem('mediqAdmin');window.location.href='index.html';});
$('#date-label').textContent=new Intl.DateTimeFormat('az-AZ',{weekday:'long',day:'numeric',month:'long'}).format(new Date()).toLocaleUpperCase('az-AZ');
render();
