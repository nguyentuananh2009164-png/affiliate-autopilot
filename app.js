// Dán Project URL và Publishable key (hoặc anon key cũ) từ Supabase vào đây.
const SUPABASE_URL = "https://xhakjulqswizhzxuolst.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_pqCBmg1IwpxyskubBMsw9Q_IAKfck4E";

const $ = (id) => document.getElementById(id);
const configured = !SUPABASE_URL.startsWith("YOUR_") && !SUPABASE_ANON_KEY.startsWith("YOUR_");
let client = null;
let products = [];

if (configured && window.supabase) {
  client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  $("configNotice").classList.add("hidden");
}
function money(n){return new Intl.NumberFormat("vi-VN").format(Number(n)||0)+"₫";}
function msg(id,text,isError=false){$(id).textContent=text;$(id).style.color=isError?"#b42318":"#28734a";}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function resetForm(){ $("productForm").reset();$("productId").value="";$("price").value=0;$("commission").value=0;$("rating").value=0;$("reviewCount").value=0;$("status").value="candidate";$("formTitle").textContent="Thêm sản phẩm"; }
async function refresh(){
  const {data,error}=await client.from("products").select("*").order("created_at",{ascending:false});
  if(error){msg("formMessage",error.message,true);return;}
  products=data||[];render();
}
function render(){
  $("totalCount").textContent=products.length;
  $("activeCount").textContent=products.filter(p=>p.status==="active").length;
  $("commissionTotal").textContent=money(products.reduce((s,p)=>s+(Number(p.commission)||0),0));
  const q=$("search").value.toLowerCase();
  const shown=products.filter(p=>(p.name+" "+(p.category||"")).toLowerCase().includes(q));
  $("productList").innerHTML=shown.length?shown.map(p=>`<article class="product">
    <h3>${esc(p.name)}</h3><div class="meta">${esc(p.category||"Chưa phân loại")} · ${p.status==="active"?"Đang quảng bá":p.status==="paused"?"Tạm dừng":"Đang cân nhắc"}</div>
    <p>Giá: ${money(p.price)} · Hoa hồng dự kiến: ${money(p.commission)} · Đánh giá: ${esc(p.rating)}/5</p>
    ${p.affiliate_url?`<p><a href="${esc(p.affiliate_url)}" target="_blank" rel="noopener">Mở link Affiliate</a></p>`:""}
    <div class="productActions"><button class="secondary" data-edit="${p.id}">Sửa</button><button class="secondary" data-copy="${p.id}">Sao chép link</button><button class="secondary" data-delete="${p.id}">Xóa</button></div>
  </article>`).join(""):"<p>Không tìm thấy sản phẩm.</p>";
}
async function authChanged(session){
  const logged=!!session;
  $("authPanel").classList.toggle("hidden",logged);
  $("appPanel").classList.toggle("hidden",!logged);
  $("logoutBtn").classList.toggle("hidden",!logged);
  if(logged) await refresh();
}
if(client){
  client.auth.onAuthStateChange((_event,session)=>{authChanged(session);});
  client.auth.getSession().then(({data})=>authChanged(data.session));
}else{
  $("authMessage").textContent="Hãy điền Project URL và Publishable/anon key trong app.js trước.";
}
$("signupBtn").onclick=async()=>{if(!client)return;const {error}=await client.auth.signUp({email:$("email").value,password:$("password").value});msg("authMessage",error?error.message:"Đã gửi yêu cầu tạo tài khoản. Kiểm tra email nếu cần xác nhận.",!!error);};
$("loginBtn").onclick=async()=>{if(!client)return;const {error}=await client.auth.signInWithPassword({email:$("email").value,password:$("password").value});msg("authMessage",error?error.message:"Đăng nhập thành công.",!!error);};
$("logoutBtn").onclick=async()=>{await client.auth.signOut();};
$("productForm").onsubmit=async e=>{
  e.preventDefault();if(!client)return;
  const {data:{user}}=await client.auth.getUser();if(!user)return;
  const payload={user_id:user.id,name:$("name").value.trim(),product_url:$("productUrl").value.trim()||null,affiliate_url:$("affiliateUrl").value.trim()||null,price:Number($("price").value)||0,commission:Number($("commission").value)||0,rating:Number($("rating").value)||0,review_count:Number($("reviewCount").value)||0,category:$("category").value.trim()||null,status:$("status").value,notes:$("notes").value.trim()||null,updated_at:new Date().toISOString()};
  const id=$("productId").value;
  const result=id?await client.from("products").update(payload).eq("id",id):await client.from("products").insert(payload);
  if(result.error){msg("formMessage",result.error.message,true);return;}
  msg("formMessage","Đã lưu sản phẩm.");resetForm();await refresh();
};
$("resetBtn").onclick=resetForm;
$("search").oninput=render;
$("productList").onclick=async e=>{
  const b=e.target.closest("button");if(!b)return;
  const p=products.find(x=>x.id===b.dataset.edit||x.id===b.dataset.copy||x.id===b.dataset.delete);if(!p)return;
  if(b.dataset.edit){$("productId").value=p.id;$("name").value=p.name;$("productUrl").value=p.product_url||"";$("affiliateUrl").value=p.affiliate_url||"";$("price").value=p.price;$("commission").value=p.commission;$("rating").value=p.rating;$("reviewCount").value=p.review_count;$("category").value=p.category||"";$("status").value=p.status;$("notes").value=p.notes||"";$("formTitle").textContent="Sửa sản phẩm";window.scrollTo({top:0,behavior:"smooth"});}
  if(b.dataset.copy){if(p.affiliate_url)await navigator.clipboard.writeText(p.affiliate_url);else alert("Sản phẩm chưa có link Affiliate.");}
  if(b.dataset.delete&&confirm("Xóa sản phẩm này?")){const {error}=await client.from("products").delete().eq("id",p.id);if(error)alert(error.message);else await refresh();}
};
