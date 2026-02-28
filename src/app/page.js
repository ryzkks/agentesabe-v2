"use client";

import { useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import html2canvas from "html2canvas";

const API_URL = "https://agentesabe-api.ryanvictorsantosofc.workers.dev";

const FALLBACK_SUGGESTS = [
  "Por que o narcisista encanta estranhos e destrói quem ama?",
  "Como o LinkedIn está criando profissionais cansados e culpados.",
  "R$ 319 num comedouro. Luxo exagerado ou o novo padrão?",
  "Como a TV infantil virou um cassino para cérebros em formação.",
  "Millennials: a geração que percebeu que estabilidade era ilusão.",
  "A maior guerra de todo homem é a própria mente.",
  "Por que você trabalha mais do que nunca e não avança nada.",
  "Como a Geração Z fez da sobriedade um símbolo de status.",
];

const PHOTO_THEMES = {
  default: ["photo-1557804506-669a67965ba0", "photo-1506794778202-cad84cf45f1d", "photo-1496345875659-11f7dd282d1d", "photo-1573496359142-b8d87734a5a2", "photo-1531746020798-e6953c6e8e04", "photo-1542744094-3a31f272c490", "photo-1588776814546-1ffedde3bc8c", "photo-1517841905240-472988babdf9", "photo-1529070538774-1843cb3265df", "photo-1524504388940-b1c1722653e1", "photo-1522075469751-3a6694fb2f61", "photo-1500648767791-00dcc994a43e"],
  work: ["photo-1497366216548-37526070297c", "photo-1454165804606-c3d57bc86b40", "photo-1521737852567-6949f3f9f2b5", "photo-1568992688065-536aad8a12f6", "photo-1572021335469-31706a17aaef", "photo-1593642632559-0c6d3fc62b89", "photo-1542744173-8e7e53415bb0", "photo-1522202176988-66273c2fd55f", "photo-1497215842964-222b430dc094", "photo-1553877522-43269d4ea984", "photo-1497032628192-86f99bcd76bc", "photo-1507679799987-c73779587ccf"],
  people: ["photo-1507003211169-0a1dd7228f2d", "photo-1438761681033-6461ffad8d80", "photo-1544005313-94ddf0286df2", "photo-1500648767791-00dcc994a43e", "photo-1534528741775-53994a69daeb", "photo-1506794778202-cad84cf45f1d", "photo-1547425260-76bcadfb4f2c", "photo-1552058544-f2b08422138a", "photo-1531746020798-e6953c6e8e04", "photo-1528892952291-009c663ce843", "photo-1548142813-c348350df52b", "photo-1499952127939-9bbf5af6c51c"],
  city: ["photo-1477959858617-67f85cf4f1df", "photo-1514565131-fce0801e6174", "photo-1480714378408-67cf0d13bc1b", "photo-1444723121867-7a241cacace9", "photo-1519501025264-65ba15a82390", "photo-1465447142348-e9952c393450", "photo-1449824913935-59a10b8d2000", "photo-1494522855154-9297ac14b55f", "photo-1486325212027-8081e485255e", "photo-1512453979798-5ea266f8880c", "photo-1506905925346-21bda4d32df4", "photo-1534430480872-3498386e7856"],
  lifestyle: ["photo-1506126613408-eca07ce68773", "photo-1543269664-7eef42226a21", "photo-1515023115689-589c33041d3c", "photo-1529156069898-49953e39b3ac", "photo-1484627147104-f5197bcd6651", "photo-1493770348161-369560ae357d", "photo-1476703993599-0035a21b17a9", "photo-1501386761578-eac5c94b800a", "photo-1490730141103-6cac27aaab94", "photo-1519568470290-c0c1f9f88ac0", "photo-1511632765486-a01980e01a18", "photo-1499971856191-1a420a42b498"],
  money: ["photo-1579621970563-ebec7560ff3e", "photo-1620714223084-8fcacc2dfd8d", "photo-1611974789855-9c2a0a7236a3", "photo-1563013544-824ae1b704d3", "photo-1567427017947-545c5f8d16ad", "photo-1559526324-593bc073d938", "photo-1556742044-3c52d6e88c62", "photo-1621264448270-9ef00e88a935", "photo-1554224155-6726b3ff858f", "photo-1633158829585-23ba8f7c8caf", "photo-1553729459-efe14ef6055d", "photo-1565372195458-9de0b320ef04"],
  tech: ["photo-1518770660439-4636190af475", "photo-1504639725590-34d0984388bd", "photo-1526374965328-7f61d4dc18c5", "photo-1550751827-4bd374173516", "photo-1563206767-5b18f218e8de", "photo-1535378917042-10a22c95931a", "photo-1531297484001-80022131f5a1", "photo-1460925895917-afdab827c52f", "photo-1488590528505-98d2b5aba04b", "photo-1498050108023-c5249f4df085", "photo-1555066931-4365d14bab8c", "photo-1484417894907-623942c8ee29"],
  emotions: ["photo-1531427186611-ecfd6d936c79", "photo-1541233349642-6e425fe6190e", "photo-1516534775068-ba3e7458af70", "photo-1474552226712-ac0f0961a954", "photo-1518199266791-5375a83190b7", "photo-1493836512294-502baa1986e2", "photo-1528360983277-13d401cdc186", "photo-1499970753202-d3cbf6f5da63", "photo-1489659831163-682b5086cc14", "photo-1520013817300-1f4c3268b6e4", "photo-1530103862676-de8c9debad1d", "photo-1504701954957-2010ec3bcec1"],
};

function shuffleArr(arr) { return arr.sort(() => Math.random() - .5); }

function getPhotoIds(query) {
  const q = (query || "").toLowerCase();
  if (q.match(/work|office|job|career|linkedin|burnout|empresa/)) return [...PHOTO_THEMES.work];
  if (q.match(/money|finance|dinheiro|salary|wealth|invest/)) return [...PHOTO_THEMES.money];
  if (q.match(/city|urban|street|cidade|night|rua/)) return [...PHOTO_THEMES.city];
  if (q.match(/tech|digital|phone|app|social|media/)) return [...PHOTO_THEMES.tech];
  if (q.match(/sad|alone|emotion|feel|anxiet|depress|mental|isolat|ansied/)) return [...PHOTO_THEMES.emotions];
  if (q.match(/lifestyle|food|travel|home|family|vida/)) return [...PHOTO_THEMES.lifestyle];
  if (q.match(/person|people|man|woman|face|human|gente|pessoa/)) return [...PHOTO_THEMES.people];
  return [...PHOTO_THEMES.people.slice(0, 6), ...PHOTO_THEMES.lifestyle.slice(0, 6)];
}

async function callClaude(prompt) {
  const res = await fetch(API_URL + "/claude", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-3-haiku-20240307", max_tokens: 4000, messages: [{ role: "user", content: prompt }] })
  });
  const d = await res.json();
  if (d.error) throw new Error(d.error.message);
  return d.content.map(b => b.text || "").join("");
}
function parseJ(raw) { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }

function imgToDataUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext("2d").drawImage(img, 0, 0);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("Cannot load"));
    img.src = url + (url.includes("?") ? "&" : "?") + "_t=" + Date.now();
    setTimeout(() => reject(new Error("Timeout")), 5000);
  });
}

function testImage(url) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => res(true);
    img.onerror = () => res(false);
    img.src = url;
    setTimeout(() => res(false), 4000);
  });
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authTab, setAuthTab] = useState("login");
  const [authErr, setAuthErr] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [model, setModel] = useState("millennials");
  const [step, setStep] = useState(1);
  const [tema, setTema] = useState("");

  const [suggests, setSuggests] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [selIdx, setSelIdx] = useState(-1);
  const [ideasLoading, setIdeasLoading] = useState(false);

  const [currentData, setCurrentData] = useState(null);
  const [slidesLoading, setSlidesLoading] = useState(false);
  const [slidesStatus, setSlidesStatus] = useState("");

  const [bankImages, setBankImages] = useState([]);
  const [currentImgQuery, setCurrentImgQuery] = useState("");
  const [dragSrc, setDragSrc] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("");

  const [profile, setProfile] = useState({ handle: "", avatar: null });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [igInput, setIgInput] = useState("");
  const [pendingAvatar, setPendingAvatar] = useState(null);
  const [buscarIgLoading, setBuscarIgLoading] = useState(false);

  const [dlProgress, setDlProgress] = useState(0);
  const [dlText, setDlText] = useState("");
  const [showDl, setShowDl] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const sess = localStorage.getItem("ags_session");
    if (sess) {
      setCurrentUser(sess);
      gerarSugestoesSafe();
    }
    const sp = localStorage.getItem("ags_profile");
    if (sp) {
      setProfile(JSON.parse(sp));
    }
  }, []);

  const toast = (msg, type = "") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3000);
  };

  if (!isMounted) return null;

  async function handleAuth(e) {
    e.preventDefault();
    const isReg = authTab === "reg";
    setAuthErr("");
    setAuthLoading(true);

    const email = document.getElementById(isReg ? "r-email" : "l-email").value.trim();
    const password = document.getElementById(isReg ? "r-senha" : "l-senha").value;
    const key = isReg ? document.getElementById("r-chave").value.trim().toUpperCase() : "";

    if (!email || !password || (isReg && !key)) {
      setAuthErr("Preencha todos os campos.");
      setAuthLoading(false);
      return;
    }

    try {
      const endpoint = isReg ? "/register" : "/login";
      const body = isReg ? { email, password, key } : { email, password };
      const res = await fetch(API_URL + endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!data.ok) { setAuthErr(data.error || "Erro de autenticação."); setAuthLoading(false); return; }
      localStorage.setItem("ags_token", data.token);
      loginUser(email);
    } catch (err) {
      setAuthErr("Erro de conexão. Tente novamente.");
    } finally {
      setAuthLoading(false);
    }
  };

  function loginUser(email) {
    setCurrentUser(email);
    localStorage.setItem("ags_session", email);
    gerarSugestoesSafe();
  };

  function logout() {
    localStorage.removeItem("ags_session");
    localStorage.removeItem("ags_token");
    setCurrentUser(null);
  };

  async function buscarPerfil() {
    const handle = igInput.trim().replace("@", "");
    if (!handle) { toast("Digite um @ válido", "err"); return; }
    setBuscarIgLoading(true);

    const sources = [
      `https://unavatar.io/instagram/${handle}`,
      `https://unavatar.io/${handle}`,
      `https://ui-avatars.com/api/?name=${handle}&background=3a4fd6&color=fff&size=128&bold=true&font-size=0.4`
    ];
    let loaded = false;
    for (const src of sources) {
      const ok = await testImage(src);
      if (ok) {
        setPendingAvatar(src);
        loaded = true;
        break;
      }
    }
    if (!loaded) {
      setPendingAvatar(`https://ui-avatars.com/api/?name=${handle}&background=3a4fd6&color=fff&size=128&bold=true`);
    }
    setBuscarIgLoading(false);
  };

  function handleAvUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setPendingAvatar(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  function salvarPerfil() {
    const handle = igInput.trim().replace("@", "") || currentUser || "eu";
    const newProfile = { handle, avatar: pendingAvatar };
    setProfile(newProfile);
    localStorage.setItem("ags_profile", JSON.stringify(newProfile));
    setShowProfileModal(false);
    toast("Perfil configurado! ✦", "ok");
  };

  async function gerarSugestoesSafe() {
    setSuggestLoading(true);
    setSuggests([]);
    try {
      const raw = await callClaude(`Você escreve títulos de carrosseis no estilo exato do Leo Baltazar (@leobrf_).
Retorne APENAS JSON: {"temas":["t1","t2","t3","t4","t5","t6"]}`);
      setSuggests(parseJ(raw).temas.slice(0, 6));
    } catch (e) {
      setSuggests(FALLBACK_SUGGESTS.slice(0, 6));
    } finally {
      setSuggestLoading(false);
    }
  };

  async function gerarIdeias() {
    if (!tema) { toast("Digite ou escolha um tema", "err"); return; }
    setIdeasLoading(true);
    setStep(1.5);
    try {
      const prompt = `Você é especialista no estilo narrativo. TEMA: ${tema}.
MODELO: ${model}
Gere 4 ângulos DIFERENTES. Retorne APENAS JSON: {"ideias":[{"titulo":"...","descricao":"..."}]}`;
      const raw = await callClaude(prompt);
      setIdeas(parseJ(raw).ideias);
      setStep(2);
    } catch (e) {
      toast("Erro ao gerar ideias", "err");
      setStep(1);
    } finally {
      setIdeasLoading(false);
    }
  };

  function buscarImagens(query) {
    setCurrentImgQuery(query || "people emotions lifestyle");
    setBankImages([...Array(9)].map(() => null)); // Loading state
    setTimeout(() => {
      const ids = shuffleArr(getPhotoIds(query));
      const imgs = ids.map(id => ({
        url: `https://images.unsplash.com/${id}?w=800&q=80&fit=crop`,
        thumb: `https://images.unsplash.com/${id}?w=200&h=200&q=70&fit=crop`,
        alt: query
      }));
      setBankImages(imgs);
      autoDistribuirImagens(imgs);
    }, 500);
  };

  function buscarMaisImagens() {
    const themes = Object.values(PHOTO_THEMES);
    const ids = shuffleArr([...themes[Math.floor(Math.random() * themes.length)]]);
    const imgs = ids.map(id => ({
      url: `https://images.unsplash.com/${id}?w=800&q=80&fit=crop`,
      thumb: `https://images.unsplash.com/${id}?w=200&h=200&q=70&fit=crop`,
      alt: currentImgQuery
    }));
    setBankImages(imgs);
    toast("Novas fotos!", "ok");
  };

  function pesquisaCustom() {
    const q = window.prompt("Buscar por tema:", currentImgQuery);
    if (q && q.trim()) buscarImagens(q.trim());
  };

  function handleImgUpload(e) {
    const files = Array.from(e.target.files);
    Promise.all(files.map(file => new Promise(res => {
      const reader = new FileReader();
      reader.onload = ev => res({ url: ev.target.result, thumb: ev.target.result, alt: file.name });
      reader.readAsDataURL(file);
    }))).then(newImgs => {
      setBankImages(prev => [...newImgs, ...prev]);
      assignToNextEmpty(newImgs[0]);
      toast("Foto(s) adicionadas!", "ok");
    });
  };

  function autoDistribuirImagens(imgs) {
    if (!currentData || !imgs.length) return;
    let idx = 0;
    setCurrentData(prev => {
      const newData = { ...prev };
      newData.slides = newData.slides.map(s => {
        if (s.hasImage && !s._img && idx < imgs.length) {
          const res = { ...s, _img: imgs[idx].url };
          idx++;
          return res;
        }
        return s;
      });
      return newData;
    });
  };

  function assignToNextEmpty(img) {
    if (!currentData) return;
    setCurrentData(prev => {
      const newData = { ...prev };
      let targetIdx = newData.slides.findIndex(s => s.hasImage && !s._img);
      if (targetIdx === -1) targetIdx = newData.slides.findIndex(s => s.hasImage);
      if (targetIdx !== -1) {
        newData.slides[targetIdx]._img = img.url;
        toast("Imagem aplicada!", "ok");
      }
      return newData;
    });
  };

  async function gerarSlides() {
    if (selIdx < 0) { toast("Selecione uma ideia", "err"); return; }
    setSlidesLoading(true);
    setCurrentData(null);
    setStep(3);
    try {
      const ideia = ideas[selIdx];
      const prompt = `TEMA: ${tema}. ÂNGULO: ${ideia.titulo}. 
Retorne APENAS JSON válido sem markdown:
{"tema":"string","slides":[{"id":1,"type":"cover","headline":"texto","body":"","slideType":"cover-dark","hasImage":false,"imageQuery":""},{"id":2,"type":"content","headline":"texto","body":"prosa","slideType":"light","hasImage":true,"imageQuery":"query"}]}
Gere 9 slides.`;
      const raw = await callClaude(prompt);
      const data = parseJ(raw);
      setCurrentData(data);
      const queries = [...new Set(data.slides.filter(s => s.hasImage && s.imageQuery).map(s => s.imageQuery))];
      buscarImagens(queries.join(", "));
      setStep(3.5); // Aprovação
    } catch (e) {
      toast("Erro: " + e.message, "err");
      setStep(2);
    } finally {
      setSlidesLoading(false);
    }
  };

  function aprovar() {
    setSlidesStatus("approved");
    setStep(4);
    toast("Carrossel aprovado! ✦", "ok");
  };

  function rmImg(idx) {
    setCurrentData(prev => {
      const nd = { ...prev };
      delete nd.slides[idx]._img;
      return nd;
    });
  };

  function handleDrop(e, idx) {
    e.preventDefault();
    setDragOverIdx(null);
    if (!dragSrc || !currentData) return;
    setCurrentData(prev => {
      const nd = { ...prev };
      nd.slides[idx]._img = dragSrc.url;
      nd.slides[idx].hasImage = true;
      return nd;
    });
    toast("Imagem aplicada!", "ok");
  };

  async function downloadCommon(isZip) {
    if (!currentData?.slides?.length) { toast("Nenhum carrossel", "err"); return; }
    setShowDl(true);
    setDlProgress(0);
    const slides = document.querySelectorAll("#cgrid .slide");
    const zip = isZip ? new JSZip() : null;
    const name = (currentData.tema || "carrossel").replace(/[^a-z0-9]/gi, "_").toLowerCase();

    try {
      for (let i = 0; i < slides.length; i++) {
        setDlProgress(Math.round((i / slides.length) * (isZip ? 90 : 100)));
        setDlText(`Gerando slide ${i + 1} de ${slides.length}...`);
        const el = slides[i];

        // fix images temp
        const imgs = el.querySelectorAll("img");
        const origSrcs = [];
        for (const img of imgs) {
          origSrcs.push(img.src);
          try {
            if (img.src && !img.src.startsWith("data:")) {
              img.src = await imgToDataUrl(img.src);
            }
          } catch (e) { }
        }

        const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false });

        // restore
        imgs.forEach((img, j) => { if (origSrcs[j]) img.src = origSrcs[j]; });

        if (isZip) {
          const blob = await new Promise(r => canvas.toBlob(r, "image/png"));
          zip.file(`${name}_slide_${String(i + 1).padStart(2, "0")}.png`, blob);
        } else {
          const a = document.createElement("a");
          a.href = canvas.toDataURL("image/png", 0.95);
          a.download = `${name}_slide_${String(i + 1).padStart(2, "0")}.png`;
          a.click();
          await new Promise(r => setTimeout(r, 300));
        }
      }
      if (isZip) {
        setDlProgress(95); setDlText("Compactando ZIP...");
        const content = await zip.generateAsync({ type: "blob" });
        setDlProgress(100); setDlText("Pronto!");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = `${name}.zip`;
        a.click();
      }
      toast(isZip ? "ZIP baixado! ✦" : "Slides baixados! ✦", "ok");
    } catch (e) {
      toast("Erro ao baixar: " + e.message, "err");
    } finally {
      setTimeout(() => setShowDl(false), 1000);
    }
  };

  function avHTML() {
    const initials = (profile?.handle || "?").charAt(0).toUpperCase();
    if (profile?.avatar) return <img src={profile.avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
    return <>{initials}</>;
  };

  if (!currentUser) {
    return (
      <div id="auth-screen">
        <div className="auth-box">
          <div>
            <div className="auth-logo">A Gente <span>Sabe</span></div>
            <div className="auth-tagline">Carrosséis Impecáveis</div>
          </div>
          <div className="auth-tabs">
            <button className={`auth-tab ${authTab === "login" ? "on" : ""}`} onClick={() => setAuthTab("login")}>Entrar</button>
            <button className={`auth-tab ${authTab === "reg" ? "on" : ""}`} onClick={() => setAuthTab("reg")}>Criar conta</button>
          </div>
          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="auth-field"><label>E-mail</label><input type="email" id={authTab === "reg" ? "r-email" : "l-email"} placeholder="seu@email.com" /></div>
            <div className="auth-field"><label>Senha</label><input type="password" id={authTab === "reg" ? "r-senha" : "l-senha"} placeholder={authTab === "reg" ? "Mínimo 6 caracteres" : "••••••••"} /></div>
            {authTab === "reg" && (
              <>
                <div className="auth-field"><label>Chave de acesso</label><input type="text" id="r-chave" placeholder="AGS-XXXX-XXXX-XXXX" /></div>
                <div className="auth-key-hint">🔑 Sua chave de acesso foi enviada por e-mail após a compra.</div>
              </>
            )}
            <div className="auth-err">{authErr}</div>
            <button className="auth-btn" disabled={authLoading}>{authLoading ? "Aguarde..." : (authTab === "login" ? "Entrar" : "Criar conta")}</button>
          </form>
          <div className="auth-footer">A Gente Sabe · agentesabe.online<br />Carrosséis Impecáveis para criadores de conteúdo</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header>
        <div className="logo">A Gente Sabe<b>CARROSSÉIS IMPECÁVEIS</b></div>
        <div className="header-center">
          <button className={`mtog ${model === "millennials" ? "on" : ""}`} onClick={() => setModel("millennials")}><span className="mdot" style={{ background: "var(--accent)" }}></span>Millennials</button>
          <button className={`mtog ${model === "antissocial" ? "on" : ""}`} onClick={() => setModel("antissocial")}><span className="mdot" style={{ background: "var(--teal)" }}></span>Antissocial</button>
        </div>
        <div className="header-right">
          <div className="pchip loaded" onClick={() => setShowProfileModal(true)}>
            <div className="pav">{avHTML()}</div>
            <div><div className="pname">{profile.handle ? "@" + profile.handle : "Meu perfil"}</div><div className="phandle">configurar →</div></div>
          </div>
          <button className="logout-btn" onClick={logout}>Sair</button>
        </div>
      </header>

      <div className="shell">
        <aside className="left">
          <div className="lscroll">
            <div className="sflow">
              <div className={`sfstep ${step > 1 ? "done" : step === 1 ? "active" : ""}`}><div className="sfn">1</div>Tema</div><div className="sfarr">›</div>
              <div className={`sfstep ${step > 2 ? "done" : step >= 1.5 && step <= 2 ? "active" : ""}`}><div className="sfn">2</div>Ideia</div><div className="sfarr">›</div>
              <div className={`sfstep ${step > 3.5 ? "done" : step >= 3 && step <= 3.5 ? "active" : ""}`}><div className="sfn">3</div>Slides</div><div className="sfarr">›</div>
              <div className={`sfstep ${step === 4 ? "active" : ""}`}><div className="sfn">4</div>Pronto</div>
            </div>

            <div style={{ display: step >= 1 && step <= 1.5 ? "block" : "none" }}>
              <div className="slabel">Tema do carrossel</div>
              <textarea rows={3} placeholder="Ex: A síndrome do impostor..." value={tema} onChange={e => setTema(e.target.value)}></textarea>
              <div className="hint" style={{ marginTop: "6px", marginBottom: "8px" }}>Sem ideia? Clique numa sugestão:</div>
              <div className="suggest-list">
                {suggestLoading ? <div className="suggest-chip" style={{ opacity: 0.4 }}>gerando...</div> :
                  suggests.map(s => <div key={s} className="suggest-chip" onClick={() => setTema(s)}>{s}</div>)}
              </div>
              <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                <button className="btn bghost bsm" onClick={gerarSugestoesSafe}>↺</button>
                <button className="btn bacc bfull" onClick={gerarIdeias} disabled={ideasLoading}>
                  {ideasLoading ? "Gerando..." : "Gerar ideias"}
                </button>
              </div>
            </div>

            <div style={{ display: step === 2 ? "block" : "none" }}>
              <div className="slabel">Escolha um ângulo</div>
              <div className="ideas-list">
                {ideas.map((idea, i) => (
                  <div key={i} className={`idea-card ${selIdx === i ? "selected" : ""}`} onClick={() => setSelIdx(i)}>
                    <div className="inum">{i + 1}</div>
                    <div><div className="ititle">{idea.titulo}</div><div className="isub">{idea.descricao}</div></div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                <button className="btn bghost" style={{ flex: 1, padding: "10px 0" }} onClick={gerarIdeias}>↺ Novas</button>
                <button className="btn bacc" style={{ flex: 2, padding: "10px 0" }} onClick={gerarSlides} disabled={selIdx < 0 || slidesLoading}>{slidesLoading ? "Gerando..." : "Gerar slides"}</button>
              </div>
            </div>

            {step >= 3 && step < 4 && (
              <div className="img-bank-section visible">
                <div className="slabel">Imagens</div>
                <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                  <button className="btn bghost bsm" style={{ flex: 1 }} onClick={buscarMaisImagens}>↺ Novas</button>
                  <button className="btn bghost bsm" style={{ flex: 1 }} onClick={pesquisaCustom}>🔍 Buscar</button>
                  <label className="btn bghost bsm" style={{ flex: 1 }}>⬆ Upload<input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleImgUpload} /></label>
                </div>
                <div className="img-grid">
                  {bankImages.map((img, i) => img ? (
                    <div key={i} className="img-thumb" draggable onDragStart={(e) => { setDragSrc(img); e.dataTransfer.effectAllowed = "copy" }} onClick={() => assignToNextEmpty(img)}>
                      <img src={img.thumb} alt={img.alt} loading="lazy" /><div className="img-thumb-ov">＋</div>
                    </div>
                  ) : <div key={i} className="img-loading"></div>)}
                </div>
              </div>
            )}

            {step === 3.5 && (
              <div>
                <div className="slabel">O que achou?</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button className="btn bacc bfull" onClick={aprovar}>✓ &nbsp;Aprovado — ficou ótimo!</button>
                  <button className="btn bghost bfull" style={{ padding: "11px" }} onClick={gerarSlides}>↺ &nbsp;Regerar com mesma ideia</button>
                  <button className="btn bdanger bfull" style={{ padding: "10px" }} onClick={() => setStep(2)}>← &nbsp;Trocar ângulo / tema</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="slabel">Carrossel aprovado ✦</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button className="btn bacc bfull" onClick={() => downloadCommon(true)}>Baixar todos (ZIP)</button>
                  <button className="btn bghost bfull" style={{ padding: "11px" }} onClick={() => downloadCommon(false)}>Baixar separados (PNG)</button>
                  <button className="btn bghost bfull" style={{ padding: "10px" }} onClick={() => { setStep(1); setTema(""); setCurrentData(null); }}>+ &nbsp;Novo carrossel</button>
                </div>
              </div>
            )}

          </div>
        </aside>

        <main className="right">
          <div className="pbar">
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="ptitle">Preview</div>
              <div className="sbadge">{currentData?.slides?.length || "—"} slides</div>
            </div>
            <div style={{ fontSize: "11px", color: "var(--muted2)" }}>Modelo: <b style={{ color: model === "millennials" ? "var(--accent)" : "var(--teal)" }}>{model === "millennials" ? "Millennials" : "Antissocial"}</b></div>
          </div>

          <div className="pscroll" id="pscroll">
            {!currentData && !slidesLoading && (
              <div className="empty">
                <div className="empty-icon">✦</div>
                <div className="empty-h">Nenhum carrossel ainda</div>
                <div className="empty-p">Escreva um tema e clique em Gerar ideias para começar.</div>
              </div>
            )}

            {slidesLoading && (
              <div className="cgrid" style={{ display: "flex" }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`slide ${i % 3 === 0 ? "sl-dark" : "sl-light"}`} style={{ opacity: 0.4 }}>
                    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "28px", gap: "11px" }}>
                      <div className="skel" style={{ height: "9px", width: "50%" }}></div>
                      <div className="skel" style={{ height: "20px", width: "80%", marginTop: "10px" }}></div>
                      <div className="skel" style={{ flex: 1, marginTop: "8px" }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentData && (
              <div className="cgrid" id="cgrid" style={{ display: "flex" }}>
                {currentData.slides.map((s, idx) => {
                  const isCover = s.type === "cover";
                  const isDark = s.slideType === "dark" || s.slideType === "cover-dark";
                  const handle = profile.handle || "agentesabe";
                  return (
                    <div key={idx}
                      className={`slide ${isCover ? "sl-cover" : isDark ? "sl-dark" : "sl-light"} ${slidesStatus === "approved" ? "approved" : ""} ${dragOverIdx === idx ? "drag-over" : ""}`}
                      onDragOver={e => { e.preventDefault(); setDragOverIdx(idx); }}
                      onDragLeave={() => setDragOverIdx(null)}
                      onDrop={e => handleDrop(e, idx)}
                    >
                      <div className="drop-hint">Soltar imagem aqui</div>
                      {isCover ? (
                        <>
                          <div className="covbg"></div><div className="covgrad"></div>
                          <div className="covinner">
                            <div className="s-auth">
                              <div className="s-av">{avHTML()}</div>
                              <div><span className="s-aname">@{handle}</span><span className="s-ahandle">{handle}</span></div>
                            </div>
                            <div className="s-headline">{s.headline}</div>
                            {s.body && <div className="s-body">{s.body}</div>}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="s-topbar"><span>Carrosséis Impecáveis<br />A Gente Sabe</span><span>@2026 All Rights Reserved<br />AgenteSabe</span></div>
                          <div className="s-headline" style={{ marginTop: "14px" }}>{s.headline}</div>
                          {s.body && <div className="s-body">{s.body}</div>}
                          {s.hasImage && (
                            <div className="s-img">
                              {s._img ? (
                                <><img src={s._img} alt="" /><button className="s-img-rm" onClick={() => rmImg(idx)}>✕</button></>
                              ) : <div className="s-img-ph">📷 clique em imagem no banco</div>}
                            </div>
                          )}
                          <div className="s-footer">
                            <span>www.agentesabe.online</span>
                            <div className="mktlogo">Carrosséis<span>Impecáveis</span></div>
                            <span>@agentesabe // @{handle}</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      <div className={`dl-progress ${showDl ? "show" : ""}`}>
        <div style={{ fontSize: "13px", fontFamily: "var(--font-syne), sans-serif", fontWeight: 700 }}>{dlText}</div>
        <div className="dl-bar-wrap"><div className="dl-bar" style={{ width: dlProgress + "%" }}></div></div>
      </div>

      <div className={`toast ${toastMsg ? "show" : ""} ${toastType}`}>{toastMsg}</div>

      {showProfileModal && (
        <div className="modal-bg show" onClick={(e) => { if (e.target === e.currentTarget) setShowProfileModal(false) }}>
          <div className="modal">
            <h3 style={{ fontFamily: "var(--font-syne), sans-serif", fontSize: "16px", fontWeight: 700 }}>Seu perfil nos carrosséis</h3>
            <div className="modal-sub">Adicione seu @ do Instagram ou faça upload da sua foto de perfil.</div>
            <div className="ig-row">
              <span className="ig-at">@</span>
              <input type="text" value={igInput} onChange={e => setIgInput(e.target.value)} placeholder="seuhandle" />
              <button className="btn bghost bsm" onClick={buscarPerfil}>{buscarIgLoading ? "..." : "Buscar"}</button>
            </div>
            {pendingAvatar && (
              <div className="pp-preview" style={{ display: "flex" }}>
                <div className="pp-av"><img src={pendingAvatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                <div>
                  <div className="pp-name">@{igInput || currentUser || "eu"}</div>
                  <div className="pp-handle">instagram.com/{igInput || currentUser || "eu"}</div>
                </div>
              </div>
            )}
            <div style={{ marginTop: "4px" }}>
              <div style={{ fontSize: "11px", color: "var(--muted2)", marginBottom: "8px" }}>— ou faça upload da sua foto —</div>
              <label className="upload-av-label">
                📷 Escolher foto do computador
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvUpload} />
              </label>
            </div>
            <div className="modal-btns" style={{ marginTop: "4px" }}>
              <button className="btn bghost" style={{ flex: 1, padding: "11px" }} onClick={() => setShowProfileModal(false)}>Cancelar</button>
              <button className="btn bacc" style={{ flex: 2, padding: "11px", fontSize: "13px" }} onClick={salvarPerfil} disabled={!pendingAvatar}>Salvar perfil</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
