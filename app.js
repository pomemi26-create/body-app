const { useState, useRef } = React;
const USER = { height:157.8, weight:54.2, goal:48, age:31, activityLevel:1.40 };
const STD_W = Math.pow(USER.height/100,2)*22;
const BMR = 10*USER.weight+6.25*USER.height-5*USER.age-161;
const TDEE = Math.round(BMR*USER.activityLevel);
const WD_F = Math.round(STD_W-5);
const WD_P = Math.min(Math.round(USER.weight*0.85*1.6),100);
const WD_KCAL = 1500;
const WD_C = Math.round((WD_KCAL-WD_P*4-WD_F*9)/4);
const RF_KCAL = TDEE;
const RF_F = Math.round(STD_W);
const RF_P = WD_P;
const RF_C = Math.round((RF_KCAL-RF_P*4-RF_F*9)/4);

const TABS = [
  {icon:"🏠",label:"ホーム"},
  {icon:"🍽",label:"食事"},
  {icon:"⚖️",label:"体重"},
  {icon:"📊",label:"グラフ"},
  {icon:"💬",label:"相談"},
  {icon:"📥",label:"出力"},
];
const MEAL_TYPES = ["朝食","昼食","夕食","間食"];
const SK = "body-app-data-v1";

const QUOTES = [
  {text:"筋肉はすぐにはつかないけど、積み重ねは裏切らない💪",cat:"筋トレ"},
  {text:"有酸素運動は脂肪を燃やすだけじゃなく、心も軽くしてくれる🏃‍♀️",cat:"有酸素"},
  {text:"食事管理は我慢じゃなく、自分を大切にすること🥗",cat:"食事管理"},
  {text:"炭水化物は敵じゃない。代謝を守る大切な仲間🍚",cat:"食事管理"},
  {text:"体重は毎日変わる。大切なのは週平均の流れ📈",cat:"ダイエット"},
  {text:"今日できなくても、明日また始められる。それでいい🌸",cat:"モチベ"},
  {text:"筋トレ後のタンパク質補給が、明日の引き締まりをつくる💎",cat:"筋トレ"},
  {text:"完璧な食事より、続けられる食事の方が100倍価値がある✨",cat:"ダイエット"},
  {text:"朝の体重が重くても、それは昨日の塩分やむくみかも🌊",cat:"ダイエット"},
  {text:"今日の一歩が、3ヶ月後の自分をつくっている🌟",cat:"モチベ"},
  {text:"睡眠は最高のボディメイクツール。寝ている間も変わってる😴",cat:"モチベ"},
  {text:"タンパク質をしっかり摂ると、空腹感がぐっと落ち着く🍳",cat:"食事管理"},
  {text:"ウォーキングだって立派な有酸素。今日の歩数を誇ろう👟",cat:"有酸素"},
  {text:"数字じゃなく、鏡の自分と体の調子で成功を測ろう🪞",cat:"ダイエット"},
  {text:"やる気がない日でも、記録だけしてみよう。それが継続になる📝",cat:"モチベ"},
  {text:"リフィードは食べすぎじゃない。代謝を守る戦略的な日🎉",cat:"食事管理"},
  {text:"比べるのは昨日の自分だけ。他の人のペースは関係ない💫",cat:"モチベ"},
  {text:"筋肉痛は成長のサイン。回復もトレーニングのうち🛁",cat:"筋トレ"},
  {text:"脂質は悪者じゃない。量と種類を意識するだけ🫒",cat:"食事管理"},
  {text:"有酸素より筋肉量を上げる方が、基礎代謝を底上げできる🔥",cat:"筋トレ"},
];

const DINING_TIPS = [
  "外食翌日の体重増加は、ほとんど塩分と水分のむくみ🌊 2〜3日で戻るので焦らずに。白湯やハーブティーをたっぷり飲んでゆっくり流しましょう🍵",
  "今日はいつも通りの食事に戻すだけでOK🌸「取り返そう」と食事を減らすのは逆効果。普通の1日が一番の近道です✨",
  "水分補給が最優先💧 胃に優しいお味噌汁や温かいスープがおすすめ。体をいたわる1日にしましょう🍲",
  "バナナ・きゅうり・わかめなどカリウム食材が今日のむくみ対策に◎🥒 余分な塩分を体外に出してくれます。",
  "昨日楽しめたなら大切な時間🥂 今日はお腹に優しいものを選んで、胃腸をいたわる1日にしましょう💕",
  "週平均体重で見れば大丈夫📊 1回の外食でリバウンドはしません。今日をいつも通りに過ごすことが一番賢い選択🌟",
  "納豆・卵・バナナでビタミンB群を補給しよう🍳 体の回復を助けてくれます。",
];

const CAT_COL = {"筋トレ":"#A29BFE","有酸素":"#48DBFB","食事管理":"#1DD1A1","ダイエット":"#FF9F43","モチベ":"#FF6B9D"};

// 日本時間で日付キーを取得
const toJSTDateStr = (date) => {
  const jst = new Date(date.getTime() + 9*60*60*1000);
  return jst.toISOString().split("T")[0];
};
const todayKey = () => toJSTDateStr(new Date());
const yesterdayKey = () => { const d=new Date(); d.setDate(d.getDate()-1); return toJSTDateStr(d); };
const weekKeys = () => Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(6-i)); return toJSTDateStr(d); });
const dayIdx = () => new Date().getDate()+new Date().getMonth()*31;

const lsGet = () => { try { const v=localStorage.getItem(SK); return v?JSON.parse(v):{meals:{},weights:{},recentFoods:{}}; } catch(e){ return {meals:{},weights:{},recentFoods:{}}; } };
const lsSet = (d) => { try { localStorage.setItem(SK, JSON.stringify(d)); } catch(e){ console.error(e); } };

const updateRecentFoods = (recentFoods, type, item) => {
  if(item.dOut) return recentFoods;
  const existing = recentFoods[type] || [];
  const filtered = existing.filter(f => f.name !== item.name);
  const updated = [{name:item.name,kcal:item.kcal,p:item.p,f:item.f,c:item.c}, ...filtered].slice(0,7);
  return Object.assign({}, recentFoods, {[type]: updated});
};

const IS = {width:"100%",padding:"10px 14px",borderRadius:12,border:"1.5px solid #f0f0f0",fontSize:14,marginBottom:8,outline:"none",boxSizing:"border-box",background:"#FAFAFA"};

function Donut({p,f,c,size=110}){
  const total=p*4+f*9+c*4;
  if(!total) return React.createElement("div",{style:{width:size,height:size,borderRadius:"50%",background:"#eee",margin:"auto"}});
  const segs=[{v:p*4,col:"#A29BFE"},{v:f*9,col:"#FF9F43"},{v:c*4,col:"#48DBFB"}];
  let cum=0; const cx=size/2,cy=size/2,r=size*.38,inn=size*.22;
  return (
    <svg width={size} height={size} style={{display:"block",margin:"auto"}}>
      {segs.map((s,i)=>{
        const frac=s.v/total,a1=cum*2*Math.PI-Math.PI/2; cum+=frac; const a2=cum*2*Math.PI-Math.PI/2;
        if(!frac) return null;
        const [c1,s1,c2,s2]=[Math.cos(a1),Math.sin(a1),Math.cos(a2),Math.sin(a2)];
        return <path key={i} d={"M"+cx+inn*c1+" "+cy+inn*s1+"L"+cx+r*c1+" "+cy+r*s1+"A"+r+" "+r+" 0 "+(frac>.5?1:0)+" 1 "+cx+r*c2+" "+cy+r*s2+"L"+cx+inn*c2+" "+cy+inn*s2+"A"+inn+" "+inn+" 0 "+(frac>.5?1:0)+" 0 "+cx+inn*c1+" "+cy+inn*s1+"Z"} fill={s.col}/>;
      })}
      <circle cx={cx} cy={cy} r={inn} fill="white"/>
      <text x={cx} y={cy+4} textAnchor="middle" fontSize={size*.11} fill="#555" fontWeight="bold">{Math.round(total)}</text>
      <text x={cx} y={cy+14} textAnchor="middle" fontSize={size*.08} fill="#888">kcal</text>
    </svg>
  );
}

function Bar({label,val,max,color,unit}){
  unit=unit||"g";
  const pct=max>0?Math.min(val/max*100,100):0;
  return (
    <div style={{marginBottom:6}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:2}}>
        <span style={{fontWeight:"bold",color:color}}>{label}</span>
        <span style={{color:"#555"}}>{val}{unit} / {max}{unit}</span>
      </div>
      <div style={{background:"#f0f0f0",borderRadius:8,height:10,overflow:"hidden"}}>
        <div style={{width:pct+"%",background:color,height:"100%",borderRadius:8,transition:"width .5s"}}/>
      </div>
    </div>
  );
}

function LineChart({data,color}){
  const pts=data.filter(function(d){return d.val!=null;});
  if(pts.length<2) return React.createElement("div",{style:{textAlign:"center",color:"#aaa",padding:20,fontSize:13}},"データが2日分以上あるとグラフ表示されます");
  const vals=pts.map(function(d){return d.val;}),mn=Math.min.apply(null,vals)-.5,mx=Math.max.apply(null,vals)+.5;
  const W=300,H=130,pad=30;
  const mp=pts.map(function(d,i){return {x:pad+(i/(pts.length-1))*(W-pad*2),y:H-pad-((d.val-mn)/(mx-mn))*(H-pad*2),date:d.date,val:d.val};});
  return (
    <svg width="100%" viewBox={"0 0 "+W+" "+H}>
      <polyline points={mp.map(function(p){return p.x+","+p.y;}).join(" ")} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
      {mp.map(function(p,i){return (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill={color}/>
          <text x={p.x} y={p.y-7} textAnchor="middle" fontSize={9} fill={color} fontWeight="bold">{p.val}</text>
          <text x={p.x} y={H-5} textAnchor="middle" fontSize={8} fill="#aaa">{p.date&&p.date.slice(5)}</text>
        </g>
      );})}
    </svg>
  );
}

function App(){
  const [tab,setTab]=useState(0);
  const [data,setData]=useState(function(){return lsGet();});
  const [saveSt,setSaveSt]=useState("");
  const saveTimer=useRef(null);

  const saveData=function(nd){
    setData(Object.assign({},nd));
    if(saveTimer.current) clearTimeout(saveTimer.current);
    setSaveSt("保存中...");
    saveTimer.current=setTimeout(function(){
      lsSet(nd);
      setSaveSt("✓ 保存済み");
      setTimeout(function(){setSaveSt("");},2000);
    },500);
  };

  const [mealType,setMealType]=useState("朝食");
  const [dOut,setDOut]=useState(false);
  const [fName,setFName]=useState("");
  const [kcal,setKcal]=useState("");
  const [prot,setProt]=useState("");
  const [fat,setFat]=useState("");
  const [carb,setCarb]=useState("");
  const [qty,setQty]=useState("1");
  const [showH,setShowH]=useState(false);
  const [hQ,setHQ]=useState("");
  // 体重フォーム
  const [selectedDate,setSelectedDate]=useState(function(){return todayKey();});
  const [wt,setWt]=useState("");
  const [slp,setSlp]=useState("");
  const [hunger,setHunger]=useState("普通");
  const [memo,setMemo]=useState("");

  // todayは毎レンダリング時に再計算（日付変わりに対応）
  const today = todayKey();
  const quote=QUOTES[dayIdx()%QUOTES.length];
  const meals=data.meals[today]||[];
  const tot=meals.reduce(function(a,m){return {kcal:a.kcal+m.kcal,p:a.p+m.p,f:a.f+m.f,c:a.c+m.c};},{kcal:0,p:0,f:0,c:0});
  const todayWt=data.weights[today]?data.weights[today].weight:null;
  const wk=weekKeys();
  const rem=WD_KCAL-Math.round(tot.kcal);
  const hadDOut=(data.meals[yesterdayKey()]||[]).some(function(m){return m.dOut;});
  const dTip=DINING_TIPS[dayIdx()%DINING_TIPS.length];
  const recentFoods=data.recentFoods||{};

  const getRecent=function(type){return recentFoods[type]||[];};
  const filtered=getRecent(mealType).filter(function(h){return !hQ||h.name.includes(hQ);});
  const applyH=function(item){
    setFName(item.name);
    // 1食分の基準値をセット
    setKcal(String(item.kcal));setProt(String(item.p));setFat(String(item.f));setCarb(String(item.c));
    setQty("1");
    setShowH(false);setHQ("");
  };

  const addMeal=function(){
    var nm;
    if(dOut){
      var newMeals=Object.assign({},data.meals);
      newMeals[today]=[].concat(meals,[{type:mealType,name:"外食",kcal:0,p:0,f:0,c:0,dOut:true,id:Date.now()}]);
      nm=Object.assign({},data,{meals:newMeals});
      setDOut(false);
    } else {
      if(!fName||!kcal) return;
      var q=parseFloat(qty)||1;
      var newItem={
        type:mealType,
        name:fName+(q!==1?" ×"+q:""),
        kcal:Math.round(+kcal*q),
        p:Math.round((+prot||0)*q*10)/10,
        f:Math.round((+fat||0)*q*10)/10,
        c:Math.round((+carb||0)*q*10)/10,
        id:Date.now()
      };
      var newMeals2=Object.assign({},data.meals);
      newMeals2[today]=[].concat(meals,[newItem]);
      // 履歴には1食分の基準値を保存
      var baseItem={type:mealType,name:fName,kcal:+kcal,p:+prot||0,f:+fat||0,c:+carb||0};
      var newRecent=updateRecentFoods(recentFoods,mealType,baseItem);
      nm=Object.assign({},data,{meals:newMeals2,recentFoods:newRecent});
      setFName("");setKcal("");setProt("");setFat("");setCarb("");setQty("1");
    }
    saveData(nm);
  };

  const delMeal=function(id){
    var newMeals=Object.assign({},data.meals);
    newMeals[today]=meals.filter(function(m){return m.id!==id;});
    saveData(Object.assign({},data,{meals:newMeals}));
  };

  const addWt=function(){
    if(!wt) return;
    var existing=data.weights[selectedDate]||{};
    var newEntry=Object.assign({},existing,{
      weight:+wt,
      sleep:slp||existing.sleep||"",
      hunger:hunger||existing.hunger||"普通",
      memo:memo||existing.memo||""
    });
    var newWeights=Object.assign({},data.weights);
    newWeights[selectedDate]=newEntry;
    saveData(Object.assign({},data,{weights:newWeights}));
    setWt("");setSlp("");setMemo("");
  };

  const buildSummary=function(){
    var lines=[
      "【今日の記録 "+today+"】",
      "体重: "+(todayWt||"未記録")+"kg",
      "睡眠: "+(data.weights[today]?data.weights[today].sleep||"未記録":"未記録")+"時間",
      "空腹感: "+(data.weights[today]?data.weights[today].hunger||"未記録":"未記録"),
      "",
      "【食事記録】",
      meals.length===0?"なし":meals.map(function(m){return m.dOut?"・"+m.type+": 外食":"・"+m.type+": "+m.name+" "+m.kcal+"kcal P"+m.p+"g F"+m.f+"g C"+m.c+"g";}).join("\n"),
      "",
      "合計: "+Math.round(tot.kcal)+"kcal P"+Math.round(tot.p)+"g F"+Math.round(tot.f)+"g C"+Math.round(tot.c)+"g",
    ];
    return lines.join("\n");
  };

  const exportCSV=function(type){
    var rows, filename;
    if(type==="meals"){
      rows=[["日付","食事タイプ","食品名","カロリー(kcal)","P(g)","F(g)","C(g)"]];
      Object.keys(data.meals).sort().forEach(function(date){
        (data.meals[date]||[]).forEach(function(m){
          rows.push([date,m.type,m.dOut?"外食":m.name,m.dOut?"":m.kcal,m.dOut?"":m.p,m.dOut?"":m.f,m.dOut?"":m.c]);
        });
      });
      filename="食事記録_"+today+".csv";
    } else {
      rows=[["日付","体重(kg)","睡眠(時間)","空腹感","メモ"]];
      Object.keys(data.weights).sort().forEach(function(date){
        var w=data.weights[date];
        rows.push([date,w.weight||"",w.sleep||"",w.hunger||"",w.memo||""]);
      });
      filename="体重記録_"+today+".csv";
    }
    var csv="\uFEFF"+rows.map(function(r){return r.map(function(v){return '"'+String(v).replace(/"/g,'""')+'"';}).join(",");}).join("\n");
    var a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    a.download=filename;
    a.click();
  };

  const card=function(ch,ex){
    ex=ex||{};
    return React.createElement("div",{style:Object.assign({background:"white",borderRadius:20,padding:18,marginBottom:14,boxShadow:"0 4px 15px rgba(0,0,0,0.07)"},ex)},ch);
  };

  return (
    <div style={{fontFamily:"'Hiragino Sans','Yu Gothic',sans-serif",background:"linear-gradient(135deg,#FFF0F5,#F0F8FF)",minHeight:"100vh",maxWidth:480,margin:"0 auto",paddingBottom:80}}>

      <div style={{background:"linear-gradient(135deg,#FF6B9D,#A29BFE)",padding:"20px 20px 16px",color:"white",borderRadius:"0 0 30px 30px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:11,opacity:.85,marginBottom:2}}>🌸 あなた専用</div>
            <div style={{fontSize:22,fontWeight:"bold"}}>ボディ管理アプリ</div>
            <div style={{fontSize:12,opacity:.85,marginTop:4}}>目標 {USER.goal}kg まで あと {(USER.weight-USER.goal).toFixed(1)}kg</div>
          </div>
          {saveSt&&<div style={{background:"rgba(255,255,255,0.25)",borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:"bold",marginTop:4}}>{saveSt}</div>}
        </div>
      </div>

      <div style={{padding:"16px 16px 0"}}>

        {/* ホーム */}
        {tab===0&&<div>
          {card(<div style={{display:"flex",alignItems:"flex-start",gap:10}}>
            <div style={{fontSize:24,flexShrink:0}}>💬</div>
            <div>
              <span style={{fontSize:10,fontWeight:"bold",background:CAT_COL[quote.cat]+"22",color:CAT_COL[quote.cat],borderRadius:20,padding:"2px 8px",display:"inline-block",marginBottom:4}}>{quote.cat}</span>
              <div style={{fontSize:13,color:"#444",lineHeight:1.7,marginTop:4}}>{quote.text}</div>
            </div>
          </div>,{background:"linear-gradient(135deg,#FFF5FB,#F5F0FF)",border:"1.5px solid #F0E0FF"})}
          {card(<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontWeight:"bold",fontSize:16,color:"#FF6B9D"}}>📅 今日の摂取</div>
              <div style={{fontSize:13,fontWeight:"bold",color:rem>=0?"#1DD1A1":"#FF6B9D"}}>残り {rem}kcal</div>
            </div>
            <Donut p={Math.round(tot.p)} f={Math.round(tot.f)} c={Math.round(tot.c)}/>
            <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:8,fontSize:12}}>
              {[["P","#A29BFE"],["F","#FF9F43"],["C","#48DBFB"]].map(function(x){return (
                <span key={x[0]} style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:10,borderRadius:"50%",background:x[1],display:"inline-block"}}/>{x[0]}</span>
              );})}
            </div>
            <div style={{marginTop:14}}>
              <Bar label="カロリー" val={Math.round(tot.kcal)} max={WD_KCAL} color="#FF6B9D" unit="kcal"/>
              <Bar label="P タンパク質" val={Math.round(tot.p)} max={WD_P} color="#A29BFE"/>
              <Bar label="F 脂質" val={Math.round(tot.f)} max={WD_F} color="#FF9F43"/>
              <Bar label="C 炭水化物" val={Math.round(tot.c)} max={WD_C} color="#48DBFB"/>
            </div>
          </div>)}
          {card(<div>
            <div style={{fontWeight:"bold",fontSize:15,color:"#A29BFE",marginBottom:10}}>🎯 あなたの目標PFC</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["平日 カロリー",WD_KCAL+"kcal","#FF6B9D"],["平日 P",WD_P+"g","#A29BFE"],["平日 F",WD_F+"g","#FF9F43"],["平日 C",WD_C+"g","#48DBFB"],["週末(リフィード)",RF_KCAL+"kcal","#1DD1A1"],["週末 C",RF_C+"g ↑","#1DD1A1"]].map(function(x){return (
                <div key={x[0]} style={{background:x[2]+"15",borderRadius:12,padding:"8px 12px"}}>
                  <div style={{fontSize:11,color:"#888"}}>{x[0]}</div>
                  <div style={{fontWeight:"bold",color:x[2],fontSize:15}}>{x[1]}</div>
                </div>
              );})}
            </div>
            <div style={{marginTop:10,fontSize:11,color:"#888",lineHeight:1.6}}>💡 週5日平日設定＋週末48hリフィード｜月間予測 約0.5〜0.7kg減</div>
          </div>)}
          {todayWt&&card(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:12,color:"#888"}}>今日の体重</div><div style={{fontSize:28,fontWeight:"bold",color:"#FF6B9D"}}>{todayWt}<span style={{fontSize:16}}> kg</span></div></div>
            <div style={{fontSize:32}}>⚖️</div>
          </div>)}
        </div>}

        {/* 食事 */}
        {tab===1&&<div>
          {card(<div>
            <div style={{fontWeight:"bold",fontSize:16,color:"#FF9F43",marginBottom:12}}>🍽 食事を追加</div>
            <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
              {MEAL_TYPES.map(function(t){return (
                <button key={t} onClick={function(){setMealType(t);setShowH(false);setDOut(false);}} style={{padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:13,fontWeight:"bold",background:mealType===t&&!dOut?"#FF9F43":"#f0f0f0",color:mealType===t&&!dOut?"white":"#555"}}>{t}</button>
              );})}
              <button onClick={function(){setDOut(!dOut);setShowH(false);}} style={{padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:13,fontWeight:"bold",background:dOut?"#FF6B9D":"#f0f0f0",color:dOut?"white":"#555"}}>🍾 外食</button>
            </div>
            {dOut?(
              <div style={{background:"#FFF0F8",borderRadius:14,padding:14,marginBottom:10}}>
                <div style={{fontSize:13,color:"#FF6B9D",fontWeight:"bold",marginBottom:6}}>🍾 外食モード</div>
                <div style={{fontSize:12,color:"#888",lineHeight:1.6,marginBottom:10}}>カロリーの入力は不要です🌸</div>
                <div style={{display:"flex",gap:6}}>
                  {MEAL_TYPES.map(function(t){return (
                    <button key={t} onClick={function(){setMealType(t);}} style={{flex:1,padding:"6px 4px",borderRadius:10,border:"none",fontSize:12,cursor:"pointer",fontWeight:"bold",background:mealType===t?"#FF6B9D":"#f0f0f0",color:mealType===t?"white":"#555"}}>{t}</button>
                  );})}
                </div>
              </div>
            ):(
              <div>
                <button onClick={function(){setShowH(!showH);}} style={{width:"100%",padding:10,borderRadius:12,border:"2px dashed #FF9F43",background:"white",color:"#FF9F43",fontWeight:"bold",cursor:"pointer",marginBottom:10}}>
                  {showH?"▲ 履歴を閉じる":"🕐 "+mealType+"の直近履歴（"+getRecent(mealType).length+"件）"}
                </button>
                {showH&&(
                  <div style={{marginBottom:10,background:"#FFF8F0",borderRadius:14,padding:12}}>
                    <input value={hQ} onChange={function(e){setHQ(e.target.value);}} placeholder="絞り込む..." style={Object.assign({},IS,{marginBottom:8})}/>
                    {filtered.length===0?(
                      <div style={{textAlign:"center",color:"#aaa",fontSize:13,padding:"8px 0"}}>まだ履歴がありません</div>
                    ):(
                      <div>
                        {filtered.map(function(item,i){return (
                          <div key={i} onClick={function(){applyH(item);}} style={{padding:"9px 12px",borderRadius:10,marginBottom:6,background:"white",cursor:"pointer",fontSize:13,display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                            <div><div style={{fontWeight:"bold",color:"#333"}}>{item.name}</div><div style={{fontSize:11,color:"#aaa",marginTop:2}}>P{item.p}g F{item.f}g C{item.c}g</div></div>
                            <span style={{fontWeight:"bold",color:"#FF9F43"}}>{item.kcal}kcal</span>
                          </div>
                        );})}
                      </div>
                    )}
                  </div>
                )}
                <input value={fName} onChange={function(e){setFName(e.target.value);}} placeholder="食品名" style={IS}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  <input value={kcal} onChange={function(e){setKcal(e.target.value);}} placeholder="カロリー(kcal)" type="number" style={IS}/>
                  <input value={prot} onChange={function(e){setProt(e.target.value);}} placeholder="P(g)" type="number" style={IS}/>
                  <input value={fat} onChange={function(e){setFat(e.target.value);}} placeholder="F(g)" type="number" style={IS}/>
                  <input value={carb} onChange={function(e){setCarb(e.target.value);}} placeholder="C(g)" type="number" style={IS}/>
                </div>
                {/* 数量 */}
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:13,color:"#888",marginBottom:6,fontWeight:"bold"}}>数量（個・杯・倍など）</div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <input
                      value={qty}
                      onChange={function(e){setQty(e.target.value);}}
                      placeholder="1"
                      type="number"
                      step="0.1"
                      min="0.1"
                      style={Object.assign({},IS,{marginBottom:0,flex:1})}
                    />
                    <div style={{display:"flex",gap:4}}>
                      {["0.5","1","1.5","2"].map(function(q){return (
                        <button key={q} onClick={function(){setQty(q);}} style={{padding:"8px 10px",borderRadius:10,border:"none",cursor:"pointer",fontSize:12,fontWeight:"bold",background:qty===q?"#FF9F43":"#f0f0f0",color:qty===q?"white":"#555"}}>{q}</button>
                      );})}
                    </div>
                  </div>
                </div>
                {/* 計算プレビュー */}
                {kcal&&parseFloat(qty)>0&&parseFloat(qty)!==1&&(
                  <div style={{background:"#FFF8F0",borderRadius:12,padding:"10px 14px",marginBottom:8,fontSize:12,color:"#FF9F43"}}>
                    <div style={{fontWeight:"bold",marginBottom:4}}>📊 ×{qty} で計算した値</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",textAlign:"center",gap:4}}>
                      {[
                        ["kcal",Math.round((+kcal||0)*parseFloat(qty)),"#FF6B9D"],
                        ["P(g)",Math.round((+prot||0)*parseFloat(qty)*10)/10,"#A29BFE"],
                        ["F(g)",Math.round((+fat||0)*parseFloat(qty)*10)/10,"#FF9F43"],
                        ["C(g)",Math.round((+carb||0)*parseFloat(qty)*10)/10,"#48DBFB"]
                      ].map(function(x){return (
                        <div key={x[0]} style={{background:x[2]+"15",borderRadius:8,padding:"4px 0"}}>
                          <div style={{fontSize:10,color:"#888"}}>{x[0]}</div>
                          <div style={{fontWeight:"bold",color:x[2]}}>{x[1]}</div>
                        </div>
                      );})}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button onClick={addMeal} style={{width:"100%",padding:12,borderRadius:12,border:"none",background:dOut?"linear-gradient(135deg,#FF6B9D,#A29BFE)":"linear-gradient(135deg,#FF9F43,#FF6B9D)",color:"white",fontWeight:"bold",fontSize:15,cursor:"pointer"}}>
              {dOut?"🍾 外食を記録する":"＋ 追加する"}
            </button>
          </div>)}
          {MEAL_TYPES.map(function(type){
            var items=meals.filter(function(m){return m.type===type;});
            if(!items.length) return null;
            return (
              <div key={type} style={{marginBottom:10}}>
                <div style={{fontWeight:"bold",fontSize:14,color:"#888",marginBottom:6,paddingLeft:4}}>{type}</div>
                {items.map(function(m){return (
                  <div key={m.id} style={{background:m.dOut?"#FFF0F8":"white",borderRadius:14,padding:"10px 14px",marginBottom:6,boxShadow:"0 2px 8px rgba(0,0,0,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontWeight:"bold",fontSize:13,color:m.dOut?"#FF6B9D":"#333"}}>{m.dOut?"🍾 外食":m.name}</div>
                      {!m.dOut&&<div style={{fontSize:11,color:"#aaa",marginTop:2}}>P{m.p}g F{m.f}g C{m.c}g</div>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      {!m.dOut&&<span style={{fontWeight:"bold",color:"#FF9F43"}}>{m.kcal}kcal</span>}
                      <button onClick={function(){delMeal(m.id);}} style={{background:"#FFE0E0",border:"none",borderRadius:8,padding:"4px 8px",cursor:"pointer",color:"#FF6B9D",fontSize:13}}>✕</button>
                    </div>
                  </div>
                );})}
              </div>
            );
          })}
          {meals.filter(function(m){return !m.dOut;}).length>0&&card(
            <div style={{fontSize:14}}>
              <div style={{fontWeight:"bold",color:"#FF6B9D",marginBottom:8}}>本日の合計</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",textAlign:"center",gap:6}}>
                {[["kcal",Math.round(tot.kcal),"#FF6B9D"],["P(g)",Math.round(tot.p),"#A29BFE"],["F(g)",Math.round(tot.f),"#FF9F43"],["C(g)",Math.round(tot.c),"#48DBFB"]].map(function(x){return (
                  <div key={x[0]} style={{background:x[2]+"15",borderRadius:10,padding:8}}>
                    <div style={{fontSize:10,color:"#888"}}>{x[0]}</div>
                    <div style={{fontWeight:"bold",color:x[2],fontSize:16}}>{x[1]}</div>
                  </div>
                );})}
              </div>
            </div>
          )}
        </div>}

        {/* 体重 */}
        {tab===2&&<div>
          {card(<div>
            <div style={{fontWeight:"bold",fontSize:16,color:"#1DD1A1",marginBottom:12}}>⚖️ 体重・体調を記録</div>

            {/* 日付選択 */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:13,color:"#888",marginBottom:6,fontWeight:"bold"}}>📅 記録する日付</div>
              <input
                type="date"
                value={selectedDate}
                max={todayKey()}
                onChange={function(e){setSelectedDate(e.target.value);}}
                style={IS}
              />
              {selectedDate!==today&&(
                <div style={{fontSize:12,color:"#FF9F43",marginTop:2}}>⚠️ 過去の日付に記録します</div>
              )}
            </div>

            {hadDOut&&selectedDate===today&&(
              <div style={{background:"linear-gradient(135deg,#FFF0F8,#F5F0FF)",border:"1.5px solid #F0C0E0",borderRadius:14,padding:14,marginBottom:14}}>
                <div style={{fontWeight:"bold",fontSize:13,color:"#FF6B9D",marginBottom:6}}>🍾 昨日外食だったあなたへ</div>
                <div style={{fontSize:13,color:"#555",lineHeight:1.8}}>{dTip}</div>
              </div>
            )}
            <input value={wt} onChange={function(e){setWt(e.target.value);}} placeholder="体重 (kg) 例: 53.8" type="number" step="0.1" style={IS}/>
            <input value={slp} onChange={function(e){setSlp(e.target.value);}} placeholder="睡眠時間 (時間) 例: 7" type="number" step="0.5" style={IS}/>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:13,color:"#888",marginBottom:6}}>空腹感</div>
              <div style={{display:"flex",gap:6}}>
                {["少ない","普通","強い","とても強い"].map(function(h){return (
                  <button key={h} onClick={function(){setHunger(h);}} style={{flex:1,padding:"6px 4px",borderRadius:10,border:"none",fontSize:12,cursor:"pointer",fontWeight:"bold",background:hunger===h?"#1DD1A1":"#f0f0f0",color:hunger===h?"white":"#555"}}>{h}</button>
                );})}
              </div>
            </div>
            <input value={memo} onChange={function(e){setMemo(e.target.value);}} placeholder="メモ (むくみ・体調など)" style={IS}/>
            <button onClick={addWt} style={{width:"100%",padding:12,borderRadius:12,border:"none",background:"linear-gradient(135deg,#1DD1A1,#48DBFB)",color:"white",fontWeight:"bold",fontSize:15,cursor:"pointer"}}>＋ 記録する</button>
          </div>)}

          <div style={{fontWeight:"bold",fontSize:15,color:"#555",marginBottom:8,paddingLeft:4}}>📋 今週の記録</div>
          {wk.slice().reverse().map(function(k){
            var w=data.weights[k];
            if(!w||!w.weight) return (
              <div key={k} style={{background:"white",borderRadius:14,padding:"10px 16px",marginBottom:8,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                <div style={{fontSize:12,color:"#aaa"}}>{k}</div>
                <div style={{fontSize:13,color:"#ddd",marginTop:2}}>未記録</div>
              </div>
            );
            return (
              <div key={k} style={{background:"white",borderRadius:14,padding:"12px 16px",marginBottom:8,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:12,color:"#aaa"}}>{k}</div><div style={{fontWeight:"bold",fontSize:20,color:"#1DD1A1"}}>{w.weight}<span style={{fontSize:13}}> kg</span></div></div>
                  <div style={{fontSize:12,color:"#888",textAlign:"right"}}>
                    {w.sleep&&<div>💤 {w.sleep}時間</div>}
                    {w.hunger&&<div>🍴 {w.hunger}</div>}
                    {w.memo&&<div style={{maxWidth:120,overflow:"hidden",textOverflow:"ellipsis"}}>📝 {w.memo}</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>}

        {/* グラフ */}
        {tab===3&&<div>
          {card(<div><div style={{fontWeight:"bold",fontSize:16,color:"#48DBFB",marginBottom:10}}>📈 体重推移 (7日間)</div><LineChart data={wk.map(function(k){return {date:k,val:data.weights[k]?data.weights[k].weight:null};})} color="#FF6B9D"/></div>)}
          {card(<div><div style={{fontWeight:"bold",fontSize:15,color:"#A29BFE",marginBottom:10}}>📊 週間カロリー推移</div><LineChart data={wk.map(function(k){return {date:k,val:data.meals[k]?Math.round(data.meals[k].filter(function(m){return !m.dOut;}).reduce(function(a,m){return a+m.kcal;},0)):null};})} color="#FF9F43"/></div>)}
          {card(<div>
            <div style={{fontWeight:"bold",fontSize:15,color:"#555",marginBottom:10}}>🎯 進捗サマリー</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["スタート体重",USER.weight+"kg","#FF6B9D"],["目標体重",USER.goal+"kg","#1DD1A1"],["目標まで",(USER.weight-USER.goal).toFixed(1)+"kg","#A29BFE"],["TDEE(維持)",TDEE+"kcal","#48DBFB"]].map(function(x){return (
                <div key={x[0]} style={{background:x[2]+"15",borderRadius:12,padding:"10px 12px"}}>
                  <div style={{fontSize:11,color:"#888"}}>{x[0]}</div>
                  <div style={{fontWeight:"bold",color:x[2],fontSize:16}}>{x[1]}</div>
                </div>
              );})}
            </div>
          </div>)}
        </div>}

        {/* 相談 */}
        {tab===4&&<div>
          {card(<div>
            <div style={{fontWeight:"bold",fontSize:16,color:"#A29BFE",marginBottom:8}}>💬 Claudeに相談する</div>
            <div style={{fontSize:13,color:"#888",marginBottom:16,lineHeight:1.8}}>今日の記録をコピーして、ClaudeにAIアドバイスをもらいましょう🌸</div>
            <div style={{background:"#F8F0FF",borderRadius:14,padding:14,marginBottom:14,fontSize:13,color:"#555",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{buildSummary()}</div>
            <button onClick={function(){if(navigator.clipboard){navigator.clipboard.writeText(buildSummary()).then(function(){alert("コピーしました！Claudeアプリに貼り付けてください🌸");});}else{alert("上の文章を手動でコピーしてください。");}}} style={{width:"100%",padding:13,borderRadius:12,border:"none",background:"linear-gradient(135deg,#A29BFE,#FF6B9D)",color:"white",fontWeight:"bold",fontSize:15,cursor:"pointer",marginBottom:10}}>
              📋 今日の記録をコピー
            </button>
            <a href="https://claude.ai" target="_blank" style={{display:"block",width:"100%",padding:13,borderRadius:12,background:"linear-gradient(135deg,#FF6B9D,#FF9F43)",color:"white",fontWeight:"bold",fontSize:15,textAlign:"center",textDecoration:"none"}}>
              🤖 Claudeを開く
            </a>
          </div>)}
        </div>}

        {/* 出力 */}
        {tab===5&&<div>
          {card(<div>
            <div style={{fontWeight:"bold",fontSize:16,color:"#1DD1A1",marginBottom:8}}>📥 データ出力</div>
            <div style={{fontSize:13,color:"#888",marginBottom:16,lineHeight:1.8}}>記録をCSVで出力できます。ExcelやGoogleスプレッドシートで開けます📊</div>
            <div style={{marginBottom:16}}>
              <div style={{fontWeight:"bold",fontSize:14,color:"#FF9F43",marginBottom:6}}>🍽 食事記録</div>
              <div style={{fontSize:12,color:"#888",marginBottom:8}}>記録件数: {Object.values(data.meals).flat().length}件</div>
              <button onClick={function(){exportCSV("meals");}} style={{width:"100%",padding:13,borderRadius:12,border:"none",background:"linear-gradient(135deg,#FF9F43,#FF6B9D)",color:"white",fontWeight:"bold",fontSize:15,cursor:"pointer"}}>
                📥 食事記録をCSV出力
              </button>
            </div>
            <div>
              <div style={{fontWeight:"bold",fontSize:14,color:"#1DD1A1",marginBottom:6}}>⚖️ 体重記録</div>
              <div style={{fontSize:12,color:"#888",marginBottom:8}}>記録件数: {Object.keys(data.weights).length}件</div>
              <button onClick={function(){exportCSV("weights");}} style={{width:"100%",padding:13,borderRadius:12,border:"none",background:"linear-gradient(135deg,#1DD1A1,#48DBFB)",color:"white",fontWeight:"bold",fontSize:15,cursor:"pointer"}}>
                📥 体重記録をCSV出力
              </button>
            </div>
          </div>)}
        </div>}

      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderTop:"1px solid #f0f0f0",display:"flex",boxShadow:"0 -4px 20px rgba(0,0,0,0.08)"}}>
        {TABS.map(function(t,i){return (
          <button key={i} onClick={function(){setTab(i);}} style={{flex:1,padding:"8px 2px 6px",border:"none",background:"transparent",cursor:"pointer",borderTop:tab===i?"3px solid #FF6B9D":"3px solid transparent"}}>
            <div style={{fontSize:18}}>{t.icon}</div>
            <div style={{fontSize:9,fontWeight:"bold",color:tab===i?"#FF6B9D":"#aaa",marginTop:2}}>{t.label}</div>
          </button>
        );})}
      </div>
    </div>
  );
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));
