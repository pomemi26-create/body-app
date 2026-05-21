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

// タブはアイコンのみにしてスペース節約
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

const todayKey = () => new Date().toISOString().split("T")[0];
const yesterdayKey = () => { const d=new Date(); d.setDate(d.getDate()-1); return d.toISOString().split("T")[0]; };
const weekKeys = () => Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(6-i)); return d.toISOString().split("T")[0]; });
const dayIdx = () => new Date().getDate()+new Date().getMonth()*31;

const lsGet = () => { try { const v=localStorage.getItem(SK); return v?JSON.parse(v):{meals:{},weights:{},recentFoods:{}}; } catch(e){ return {meals:{},weights:{},recentFoods:{}}; } };
const lsSet = (d) => { try { localStorage.setItem(SK, JSON.stringify(d)); } catch(e){ console.error(e); } };

const IS = {width:"100%",padding:"10px 14px",borderRadius:12,border:"1.5px solid #f0f0f0",fontSize:14,marginBottom:8,outline:"none",boxSizing:"border-box",background:"#FAFAFA"};

// 食事タイプごとに直近7件を保持
const updateRecentFoods = (recentFoods, type, item) => {
  if(item.dOut) return recentFoods;
  const key = type;
  const existing = recentFoods[key] || [];
  // 同名があれば除去して先頭に追加（最新優先）
  const filtered = existing.filter(f => f.name !== item.name);
  const updated = [{name:item.name,kcal:item.kcal,p:item.p,f:item.f,c:item.c}, ...filtered].slice(0,7);
  return {...recentFoods, [key]: updated};
};

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
        return <path key={i} d={`M${cx+inn*c1} ${cy+inn*s1}L${cx+r*c1} ${cy+r*s1}A${r} ${r} 0 ${frac>.5?1:0} 1 ${cx+r*c2} ${cy+r*s2}L${cx+inn*c2} ${cy+inn*s2}A${inn} ${inn} 0 ${frac>.5?1:0} 0 ${cx+inn*c1} ${cy+inn*s1}Z`} fill={s.col}/>;
      })}
      <circle cx={cx} cy={cy} r={inn} fill="white"/>
      <text x={cx} y={cy+4} textAnchor="middle" fontSize={size*.11} fill="#555" fontWeight="bold">{Math.round(total)}</text>
      <text x={cx} y={cy+14} textAnchor="middle" fontSize={size*.08} fill="#888">kcal</text>
    </svg>
  );
}

function Bar({label,val,max,color,unit="g"}){
  const pct=max>0?Math.min(val/max*100,100):0;
  return (
    <div style={{marginBottom:6}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:2}}>
        <span style={{fontWeight:"bold",color}}>{label}</span>
        <span style={{color:"#555"}}>{val}{unit} / {max}{unit}</span>
      </div>
      <div style={{background:"#f0f0f0",borderRadius:8,height:10,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,background:color,height:"100%",borderRadius:8,transition:"width .5s"}}/>
      </div>
    </div>
  );
}

function LineChart({data,color}){
  const pts=data.filter(d=>d.val!=null);
  if(pts.length<2) return <div style={{textAlign:"center",color:"#aaa",padding:20,fontSize:13}}>データが2日分以上あるとグラフ表示されます</div>;
  const vals=pts.map(d=>d.val),mn=Math.min(...vals)-.5,mx=Math.max(...vals)+.5;
  const W=300,H=130,pad=30;
  const mp=pts.map((d,i)=>({x:pad+(i/(pts.length-1))*(W-pad*2),y:H-pad-((d.val-mn)/(mx-mn))*(H-pad*2),...d}));
  return (
    <svg width="100%" viewBox={"0 0 "+W+" "+H}>
      <polyline points={mp.map(p=>p.x+","+p.y).join(" ")} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
      {mp.map((p,i)=>(
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill={color}/>
          <text x={p.x} y={p.y-7} textAnchor="middle" fontSize={9} fill={color} fontWeight="bold">{p.val}</text>
          <text x={p.x} y={H-5} textAnchor="middle" fontSize={8} fill="#aaa">{p.date&&p.date.slice(5)}</text>
        </g>
      ))}
    </svg>
  );
}

function App(){
  const [tab,setTab]=useState(0);
  const [data,setData]=useState(()=>lsGet());
  const [saveSt,setSaveSt]=useState("");
  const saveTimer=useRef(null);

  const saveData=(nd)=>{
    setData({...nd});
    if(saveTimer.current) clearTimeout(saveTimer.current);
    setSaveSt("保存中...");
    saveTimer.current=setTimeout(()=>{
      lsSet(nd);
      setSaveSt("✓ 保存済み");
      setTimeout(()=>setSaveSt(""),2000);
    },500);
  };

  const [mealType,setMealType]=useState("朝食");
  const [dOut,setDOut]=useState(false);
  const [fName,setFName]=useState("");
  const [kcal,setKcal]=useState("");
  const [prot,setProt]=useState("");
  const [fat,setFat]=useState("");
  const [carb,setCarb]=useState("");
  const [showH,setShowH]=useState(false);
  const [hQ,setHQ]=useState("");
  const [wt,setWt]=useState("");
  const [slp,setSlp]=useState("");
  const [hunger,setHunger]=useState("普通");
  const [memo,setMemo]=useState("");

  const today=todayKey();
  const quote=QUOTES[dayIdx()%QUOTES.length];
  const meals=data.meals[today]||[];
  const tot=meals.reduce((a,m)=>({kcal:a.kcal+m.kcal,p:a.p+m.p,f:a.f+m.f,c:a.c+m.c}),{kcal:0,p:0,f:0,c:0});
  const todayWt=data.weights[today]?data.weights[today].weight:null;
  const wk=weekKeys();
  const rem=WD_KCAL-Math.round(tot.kcal);
  const hadDOut=(data.meals[yesterdayKey()]||[]).some(m=>m.dOut);
  const dTip=DINING_TIPS[dayIdx()%DINING_TIPS.length];
  const recentFoods=data.recentFoods||{};

  // 直近7件の履歴（タイプ別）
  const getRecent=(type)=>recentFoods[type]||[];
  const filtered=getRecent(mealType).filter(h=>!hQ||h.name.includes(hQ));

  const applyH=item=>{setFName(item.name);setKcal(String(item.kcal));setProt(String(item.p));setFat(String(item.f));setCarb(String(item.c));setShowH(false);setHQ("");};

  const addMeal=()=>{
    let nm;
    if(dOut){
      const newMeals={...data.meals,[today]:[...meals,{type:mealType,name:"外食",kcal:0,p:0,f:0,c:0,dOut:true,id:Date.now()}]};
      nm={...data,meals:newMeals};
      setDOut(false);
    } else {
      if(!fName||!kcal) return;
      const newItem={type:mealType,name:fName,kcal:+kcal,p:+prot||0,f:+fat||0,c:+carb||0,id:Date.now()};
      const newMeals={...data.meals,[today]:[...meals,newItem]};
      const newRecent=updateRecentFoods(recentFoods,mealType,newItem);
      nm={...data,meals:newMeals,recentFoods:newRecent};
      setFName("");setKcal("");setProt("");setFat("");setCarb("");
    }
    saveData(nm);
  };

  const delMeal=id=>saveData({...data,meals:{...data.meals,[today]:meals.filter(m=>m.id!==id)}});

  const [selectedDate, setSelectedDate] = useState(todayKey());

  const addWt=()=>{
    if(!wt) return;
    const existing = data.weights[selectedDate] || {};
    const newEntry = {
      ...existing,
      weight: +wt,
      sleep: slp || existing.sleep || "",
      hunger: hunger || existing.hunger || "普通",
      memo: memo || existing.memo || ""
    };
    const newWeights = Object.assign({}, data.weights, {[selectedDate]: newEntry});
    const newData = Object.assign({}, data, {weights: newWeights});
    saveData(newData);
    setWt(""); setSlp(""); setMemo("");
  };

  const buildSummary=()=>{
    const lines=[
      "【今日の記録 "+today+"】",
      "体重: "+(todayWt||"未記録")+"kg",
      "睡眠: "+(data.weights[today]?data.weights[today].sleep||"未記録":"未記録")+"時間",
      "空腹感: "+(data.weights[today]?data.weights[today].hunger||"未記録":"未記録"),
      "",
      "【食事記録】",
      meals.length===0?"なし":meals.map(m=>m.dOut?"・"+m.type+": 外食":"・"+m.type+": "+m.name+" "+m.kcal+"kcal P"+m.p+"g F"+m.f+"g C"+m.c+"g").join("\n"),
      "",
      "合計: "+Math.round(tot.kcal)+"kcal P"+Math.round(tot.p)+"g F"+Math.round(tot.f)+"g C"+Math.round(tot.c)+"g",
    ];
    return lines.join("\n");
  };

  const exportCSV=(type)=>{
    let rows, filename;
    if(type==="meals"){
      rows=[["日付","食事タイプ","食品名","カロリー(kcal)","P(g)","F(g)","C(g)"]];
      Object.keys(data.meals).sort().forEach(date=>{
        (data.meals[date]||[]).forEach(m=>{
          rows.push([date,m.type,m.dOut?"外食":m.name,m.dOut?"":m.kcal,m.dOut?"":m.p,m.dOut?"":m.f,m.dOut?"":m.c]);
        });
      });
      filename="食事記録_"+today+".csv";
    } else {
      rows=[["日付","体重(kg)","睡眠(時間)","空腹感","メモ"]];
      Object.keys(data.weights).sort().forEach(date=>{
        const w=data.weights[date];
        rows.push([date,w.weight||"",w.sleep||"",w.hunger||"",w.memo||""]);
      });
      filename="体重記録_"+today+".csv";
    }
    const csv="\uFEFF"+rows.map(r=>r.map(v=>"\""+String(v).replace(/"/g,'""')+"\"").join(",")).join("\n");
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    a.download=filename;
    a.click();
  };

  const card=(ch,ex={})=><div style={{background:"white",borderRadius:20,padding:18,marginBottom:14,boxShadow:"0 4px 15px rgba(0,0,0,0.07)",...ex}}>{ch}</div>;

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
        {tab===0&&<>
          {card(<div style={{display:"flex",alignItems:"flex-start",gap:10}}>
            <div style={{fontSize:24,flexShrink:0}}>💬</div>
            <div>
              <span style={{fontSize:10,fontWeight:"bold",background:CAT_COL[quote.cat]+"22",color:CAT_COL[quote.cat],borderRadius:20,padding:"2px 8px",display:"inline-block",marginBottom:4}}>{quote.cat}</span>
              <div style={{fontSize:13,color:"#444",lineHeight:1.7,marginTop:4}}>{quote.text}</div>
            </div>
          </div>,{background:"linear-gradient(135deg,#FFF5FB,#F5F0FF)",border:"1.5px solid #F0E0FF"})}
          {card(<>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontWeight:"bold",fontSize:16,color:"#FF6B9D"}}>📅 今日の摂取</div>
              <div style={{fontSize:13,fontWeight:"bold",color:rem>=0?"#1DD1A1":"#FF6B9D"}}>残り {rem}kcal</div>
            </div>
            <Donut p={Math.round(tot.p)} f={Math.round(tot.f)} c={Math.round(tot.c)}/>
            <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:8,fontSize:12}}>
              {[["P","#A29BFE"],["F","#FF9F43"],["C","#48DBFB"]].map(([l,c])=>(
                <span key={l} style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:10,borderRadius:"50%",background:c,display:"inline-block"}}/>{l}</span>
              ))}
            </div>
            <div style={{marginTop:14}}>
              <Bar label="カロリー" val={Math.round(tot.kcal)} max={WD_KCAL} color="#FF6B9D" unit="kcal"/>
              <Bar label="P タンパク質" val={Math.round(tot.p)} max={WD_P} color="#A29BFE"/>
              <Bar label="F 脂質" val={Math.round(tot.f)} max={WD_F} color="#FF9F43"/>
              <Bar label="C 炭水化物" val={Math.round(tot.c)} max={WD_C} color="#48DBFB"/>
            </div>
          </>)}
          {card(<>
            <div style={{fontWeight:"bold",fontSize:15,color:"#A29BFE",marginBottom:10}}>🎯 あなたの目標PFC</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["平日 カロリー",WD_KCAL+"kcal","#FF6B9D"],["平日 P",WD_P+"g","#A29BFE"],["平日 F",WD_F+"g","#FF9F43"],["平日 C",WD_C+"g","#48DBFB"],["週末(リフィード)",RF_KCAL+"kcal","#1DD1A1"],["週末 C",RF_C+"g ↑","#1DD1A1"]].map(([l,v,c])=>(
                <div key={l} style={{background:c+"15",borderRadius:12,padding:"8px 12px"}}>
                  <div style={{fontSize:11,color:"#888"}}>{l}</div>
                  <div style={{fontWeight:"bold",color:c,fontSize:15}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:10,fontSize:11,color:"#888",lineHeight:1.6}}>💡 週5日平日設定＋週末48hリフィード｜月間予測 約0.5〜0.7kg減</div>
          </>)}
          {todayWt&&card(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:12,color:"#888"}}>今日の体重</div><div style={{fontSize:28,fontWeight:"bold",color:"#FF6B9D"}}>{todayWt}<span style={{fontSize:16}}> kg</span></div></div>
            <div style={{fontSize:32}}>⚖️</div>
          </div>)}
        </>}

        {/* 食事 */}
        {tab===1&&<>
          {card(<>
            <div style={{fontWeight:"bold",fontSize:16,color:"#FF9F43",marginBottom:12}}>🍽 食事を追加</div>
            <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
              {MEAL_TYPES.map(t=>(
                <button key={t} onClick={()=>{setMealType(t);setShowH(false);setDOut(false);}} style={{padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:13,fontWeight:"bold",background:mealType===t&&!dOut?"#FF9F43":"#f0f0f0",color:mealType===t&&!dOut?"white":"#555"}}>{t}</button>
              ))}
              <button onClick={()=>{setDOut(!dOut);setShowH(false);}} style={{padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:13,fontWeight:"bold",background:dOut?"#FF6B9D":"#f0f0f0",color:dOut?"white":"#555"}}>🍾 外食</button>
            </div>
            {dOut?(
              <div style={{background:"#FFF0F8",borderRadius:14,padding:14,marginBottom:10}}>
                <div style={{fontSize:13,color:"#FF6B9D",fontWeight:"bold",marginBottom:6}}>🍾 外食モード</div>
                <div style={{fontSize:12,color:"#888",lineHeight:1.6,marginBottom:10}}>カロリーの入力は不要です。翌日の体重記録時にメッセージが表示されます🌸</div>
                <div style={{display:"flex",gap:6}}>
                  {MEAL_TYPES.map(t=>(
                    <button key={t} onClick={()=>setMealType(t)} style={{flex:1,padding:"6px 4px",borderRadius:10,border:"none",fontSize:12,cursor:"pointer",fontWeight:"bold",background:mealType===t?"#FF6B9D":"#f0f0f0",color:mealType===t?"white":"#555"}}>{t}</button>
                  ))}
                </div>
              </div>
            ):<>
              {/* 直近7件の履歴 */}
              <button onClick={()=>setShowH(!showH)} style={{width:"100%",padding:10,borderRadius:12,border:"2px dashed #FF9F43",background:"white",color:"#FF9F43",fontWeight:"bold",cursor:"pointer",marginBottom:10}}>
                {showH?"▲ 履歴を閉じる":"🕐 "+mealType+"の直近履歴（"+getRecent(mealType).length+"件）"}
              </button>
              {showH&&(
                <div style={{marginBottom:10,background:"#FFF8F0",borderRadius:14,padding:12}}>
                  <input value={hQ} onChange={e=>setHQ(e.target.value)} placeholder="絞り込む..." style={{...IS,marginBottom:8}}/>
                  {filtered.length===0?(
                    <div style={{textAlign:"center",color:"#aaa",fontSize:13,padding:"8px 0"}}>まだ履歴がありません</div>
                  ):(
                    <div>
                      {filtered.map((item,i)=>(
                        <div key={i} onClick={()=>applyH(item)} style={{padding:"9px 12px",borderRadius:10,marginBottom:6,background:"white",cursor:"pointer",fontSize:13,display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                          <div><div style={{fontWeight:"bold",color:"#333"}}>{item.name}</div><div style={{fontSize:11,color:"#aaa",marginTop:2}}>P{item.p}g F{item.f}g C{item.c}g</div></div>
                          <span style={{fontWeight:"bold",color:"#FF9F43"}}>{item.kcal}kcal</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <input value={fName} onChange={e=>setFName(e.target.value)} placeholder="食品名" style={IS}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                <input value={kcal} onChange={e=>setKcal(e.target.value)} placeholder="カロリー(kcal)" type="number" style={IS}/>
                <input value={prot} onChange={e=>setProt(e.target.value)} placeholder="P(g)" type="number" style={IS}/>
                <input value={fat} onChange={e=>setFat(e.target.value)} placeholder="F(g)" type="number" style={IS}/>
                <input value={carb} onChange={e=>setCarb(e.target.value)} placeholder="C(g)" type="number" style={IS}/>
              </div>
            </>}
            <button onClick={addMeal} style={{width:"100%",padding:12,borderRadius:12,border:"none",background:dOut?"linear-gradient(135deg,#FF6B9D,#A29BFE)":"linear-gradient(135deg,#FF9F43,#FF6B9D)",color:"white",fontWeight:"bold",fontSize:15,cursor:"pointer"}}>
              {dOut?"🍾 外食を記録する":"＋ 追加する"}
            </button>
          </>)}
          {MEAL_TYPES.map(type=>{
            const items=meals.filter(m=>m.type===type);
            if(!items.length) return null;
            return (
              <div key={type} style={{marginBottom:10}}>
                <div style={{fontWeight:"bold",fontSize:14,color:"#888",marginBottom:6,paddingLeft:4}}>{type}</div>
                {items.map(m=>(
                  <div key={m.id} style={{background:m.dOut?"#FFF0F8":"white",borderRadius:14,padding:"10px 14px",marginBottom:6,boxShadow:"0 2px 8px rgba(0,0,0,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontWeight:"bold",fontSize:13,color:m.dOut?"#FF6B9D":"#333"}}>{m.dOut?"🍾 外食":m.name}</div>
                      {!m.dOut&&<div style={{fontSize:11,color:"#aaa",marginTop:2}}>P{m.p}g F{m.f}g C{m.c}g</div>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      {!m.dOut&&<span style={{fontWeight:"bold",color:"#FF9F43"}}>{m.kcal}kcal</span>}
                      <button onClick={()=>delMeal(m.id)} style={{background:"#FFE0E0",border:"none",borderRadius:8,padding:"4px 8px",cursor:"pointer",color:"#FF6B9D",fontSize:13}}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          {meals.filter(m=>!m.dOut).length>0&&card(
            <div style={{fontSize:14}}>
              <div style={{fontWeight:"bold",color:"#FF6B9D",marginBottom:8}}>本日の合計</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",textAlign:"center",gap:6}}>
                {[["kcal",Math.round(tot.kcal),"#FF6B9D"],["P(g)",Math.round(tot.p),"#A29BFE"],["F(g)",Math.round(tot.f),"#FF9F43"],["C(g)",Math.round(tot.c),"#48DBFB"]].map(([l,v,c])=>(
                  <div key={l} style={{background:c+"15",borderRadius:10,padding:8}}>
                    <div style={{fontSize:10,color:"#888"}}>{l}</div>
                    <div style={{fontWeight:"bold",color:c,fontSize:16}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>}

        {/* 体重 */}
        {tab===2&&<>
          {card(<>
            <div style={{fontWeight:"bold",fontSize:16,color:"#1DD1A1",marginBottom:12}}>⚖️ 今日の体重・体調</div>
            {/* 日付選択 */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:13,color:"#888",marginBottom:6}}>記録する日付</div>
              <input
                type="date"
                value={selectedDate}
                max={todayKey()}
                onChange={e=>setSelectedDate(e.target.value)}
                style={{...IS, marginBottom:0}}
              />
              {selectedDate !== today && (
                <div style={{fontSize:12,color:"#FF9F43",marginTop:4}}>
                  ⚠️ 過去の日付に記録します
                </div>
              )}
            </div>
            {hadDOut&&(
              <div style={{background:"linear-gradient(135deg,#FFF0F8,#F5F0FF)",border:"1.5px solid #F0C0E0",borderRadius:14,padding:14,marginBottom:14}}>
                <div style={{fontWeight:"bold",fontSize:13,color:"#FF6B9D",marginBottom:6}}>🍾 昨日外食だったあなたへ</div>
                <div style={{fontSize:13,color:"#555",lineHeight:1.8}}>{dTip}</div>
              </div>
            )}
            <input value={wt} onChange={e=>setWt(e.target.value)} placeholder="体重 (kg) 例: 53.8" type="number" step="0.1" style={IS}/>
            <input value={slp} onChange={e=>setSlp(e.target.value)} placeholder="睡眠時間 (時間) 例: 7" type="number" step="0.5" style={IS}/>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:13,color:"#888",marginBottom:6}}>空腹感</div>
              <div style={{display:"flex",gap:6}}>
                {["少ない","普通","強い","とても強い"].map(h=>(
                  <button key={h} onClick={()=>setHunger(h)} style={{flex:1,padding:"6px 4px",borderRadius:10,border:"none",fontSize:12,cursor:"pointer",fontWeight:"bold",background:hunger===h?"#1DD1A1":"#f0f0f0",color:hunger===h?"white":"#555"}}>{h}</button>
                ))}
              </div>
            </div>
            <input value={memo} onChange={e=>setMemo(e.target.value)} placeholder="メモ (むくみ・体調など)" style={IS}/>
            <button onClick={addWt} style={{width:"100%",padding:12,borderRadius:12,border:"none",background:"linear-gradient(135deg,#1DD1A1,#48DBFB)",color:"white",fontWeight:"bold",fontSize:15,cursor:"pointer"}}>＋ 記録する</button>
          </>)}
          <div style={{fontWeight:"bold",fontSize:15,color:"#555",marginBottom:8,paddingLeft:4}}>📋 今週の記録</div>
          {wk.slice().reverse().map(k=>{
            const w=data.weights[k];
            if(!w || !w.weight) return (
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
        </>}

        {/* グラフ */}
        {tab===3&&<>
          {card(<><div style={{fontWeight:"bold",fontSize:16,color:"#48DBFB",marginBottom:10}}>📈 体重推移 (7日間)</div><LineChart data={wk.map(k=>({date:k,val:data.weights[k]?data.weights[k].weight:null}))} color="#FF6B9D"/></>)}
          {card(<><div style={{fontWeight:"bold",fontSize:15,color:"#A29BFE",marginBottom:10}}>📊 週間カロリー推移</div><LineChart data={wk.map(k=>({date:k,val:data.meals[k]?Math.round(data.meals[k].filter(m=>!m.dOut).reduce((a,m)=>a+m.kcal,0)):null}))} color="#FF9F43"/></>)}
          {card(<>
            <div style={{fontWeight:"bold",fontSize:15,color:"#555",marginBottom:10}}>🎯 進捗サマリー</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["スタート体重",USER.weight+"kg","#FF6B9D"],["目標体重",USER.goal+"kg","#1DD1A1"],["目標まで",(USER.weight-USER.goal).toFixed(1)+"kg","#A29BFE"],["TDEE(維持)",TDEE+"kcal","#48DBFB"]].map(([l,v,c])=>(
                <div key={l} style={{background:c+"15",borderRadius:12,padding:"10px 12px"}}>
                  <div style={{fontSize:11,color:"#888"}}>{l}</div>
                  <div style={{fontWeight:"bold",color:c,fontSize:16}}>{v}</div>
                </div>
              ))}
            </div>
          </>)}
        </>}

        {/* 相談 */}
        {tab===4&&<>
          {card(<>
            <div style={{fontWeight:"bold",fontSize:16,color:"#A29BFE",marginBottom:8}}>💬 Claudeに相談する</div>
            <div style={{fontSize:13,color:"#888",marginBottom:16,lineHeight:1.8}}>
              今日の記録をコピーして、ClaudeにAIアドバイスをもらいましょう🌸
            </div>
            <div style={{background:"#F8F0FF",borderRadius:14,padding:14,marginBottom:14,fontSize:13,color:"#555",lineHeight:1.8,whiteSpace:"pre-wrap"}}>
              {buildSummary()}
            </div>
            <button onClick={()=>{if(navigator.clipboard){navigator.clipboard.writeText(buildSummary()).then(()=>alert("コピーしました！Claudeアプリに貼り付けてください🌸"));}else{alert("お使いのブラウザではコピーできません。上の文章を手動でコピーしてください。");}}} style={{width:"100%",padding:13,borderRadius:12,border:"none",background:"linear-gradient(135deg,#A29BFE,#FF6B9D)",color:"white",fontWeight:"bold",fontSize:15,cursor:"pointer",marginBottom:10}}>
              📋 今日の記録をコピー
            </button>
            <a href="https://claude.ai" target="_blank" style={{display:"block",width:"100%",padding:13,borderRadius:12,background:"linear-gradient(135deg,#FF6B9D,#FF9F43)",color:"white",fontWeight:"bold",fontSize:15,textAlign:"center",textDecoration:"none"}}>
              🤖 Claudeを開く
            </a>
          </>)}
        </>}

        {/* 出力 */}
        {tab===5&&<>
          {card(<>
            <div style={{fontWeight:"bold",fontSize:16,color:"#1DD1A1",marginBottom:8}}>📥 データ出力</div>
            <div style={{fontSize:13,color:"#888",marginBottom:16,lineHeight:1.8}}>
              記録をCSVファイルで出力できます。<br/>ExcelやGoogleスプレッドシートで開けます📊
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontWeight:"bold",fontSize:14,color:"#FF9F43",marginBottom:6}}>🍽 食事記録</div>
              <div style={{fontSize:12,color:"#888",marginBottom:8}}>記録件数: {Object.values(data.meals).flat().length}件</div>
              <button onClick={()=>exportCSV("meals")} style={{width:"100%",padding:13,borderRadius:12,border:"none",background:"linear-gradient(135deg,#FF9F43,#FF6B9D)",color:"white",fontWeight:"bold",fontSize:15,cursor:"pointer"}}>
                📥 食事記録をCSV出力
              </button>
            </div>
            <div>
              <div style={{fontWeight:"bold",fontSize:14,color:"#1DD1A1",marginBottom:6}}>⚖️ 体重記録</div>
              <div style={{fontSize:12,color:"#888",marginBottom:8}}>記録件数: {Object.keys(data.weights).length}件</div>
              <button onClick={()=>exportCSV("weights")} style={{width:"100%",padding:13,borderRadius:12,border:"none",background:"linear-gradient(135deg,#1DD1A1,#48DBFB)",color:"white",fontWeight:"bold",fontSize:15,cursor:"pointer"}}>
                📥 体重記録をCSV出力
              </button>
            </div>
          </>)}
        </>}

      </div>

      {/* ナビゲーション - アイコン＋小さいラベル */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderTop:"1px solid #f0f0f0",display:"flex",boxShadow:"0 -4px 20px rgba(0,0,0,0.08)"}}>
        {TABS.map((t,i)=>(
          <button key={i} onClick={()=>setTab(i)} style={{flex:1,padding:"8px 2px 6px",border:"none",background:"transparent",cursor:"pointer",borderTop:tab===i?"3px solid #FF6B9D":"3px solid transparent"}}>
            <div style={{fontSize:18}}>{t.icon}</div>
            <div style={{fontSize:9,fontWeight:"bold",color:tab===i?"#FF6B9D":"#aaa",marginTop:2}}>{t.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));
