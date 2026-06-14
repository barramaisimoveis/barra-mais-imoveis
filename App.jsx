import { useState, useEffect } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const ADMIN_CREDENTIALS = { user: "admin", pass: "barra2024" };

const INITIAL_PROPERTIES = [
  {
    id: "BSF001",
    type: "Casa",
    address: "Rua das Acácias, 142",
    neighborhood: "Centro",
    city: "Barra de São Francisco",
    rent: 1200,
    condo: 0,
    rooms: 3,
    suites: 1,
    bathrooms: 2,
    parking: 1,
    description: "Casa ampla com quintal, ótima localização no centro da cidade.",
    visitNotes: "Chave disponível na imobiliária. Agendar com 24h de antecedência.",
    active: true,
    photos: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
             "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"],
    availableForScheduling: true,
  },
  {
    id: "BSF002",
    type: "Apartamento",
    address: "Av. Brasil, 890, Apto 301",
    neighborhood: "Irmãos Fernandes",
    city: "Barra de São Francisco",
    rent: 850,
    condo: 150,
    rooms: 2,
    suites: 0,
    bathrooms: 1,
    parking: 1,
    description: "Apartamento moderno, próximo ao comércio e serviços essenciais.",
    visitNotes: "Contato com o zelador no local. Portão eletrônico.",
    active: true,
    photos: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80"],
    availableForScheduling: true,
  },
  {
    id: "BSF003",
    type: "Sala Comercial",
    address: "Rua Brasília, 215",
    neighborhood: "Irmãos Fernandes",
    city: "Barra de São Francisco",
    rent: 1800,
    condo: 200,
    rooms: 0,
    suites: 0,
    bathrooms: 1,
    parking: 2,
    description: "Sala comercial de 60m², ideal para escritórios e consultórios.",
    visitNotes: "Visitas somente em horário comercial.",
    active: true,
    photos: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"],
    availableForScheduling: true,
  },
];

const INITIAL_SLOTS = {
  "2026-06-15": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  "2026-06-16": ["09:00", "10:00", "14:00", "15:00"],
  "2026-06-17": ["09:00", "11:00", "14:00", "16:00"],
  "2026-06-18": ["10:00", "14:00", "15:00"],
  "2026-06-19": ["09:00", "10:00", "11:00"],
  "2026-06-20": ["10:00", "14:00"],
};

const STATUS_COLORS = {
  Pendente: { bg: "#FFF3CD", text: "#856404", border: "#FFECB5" },
  Confirmada: { bg: "#D1ECF1", text: "#0C5460", border: "#BEE5EB" },
  Realizada: { bg: "#D4EDDA", text: "#155724", border: "#C3E6CB" },
  Cancelada: { bg: "#F8D7DA", text: "#721C24", border: "#F5C6CB" },
};

// ─── UTILS ───────────────────────────────────────────────────────────────────
const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const fmtDate = (d) => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};
const today = () => new Date().toISOString().split("T")[0];

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    home: "🏠", building: "🏢", key: "🔑", calendar: "📅", clock: "🕐",
    phone: "📱", mail: "✉️", user: "👤", check: "✅", x: "❌",
    edit: "✏️", trash: "🗑️", plus: "➕", eye: "👁️", eyeOff: "🙈",
    arrow: "→", back: "←", menu: "☰", photo: "📷", star: "⭐",
    whatsapp: "💬", location: "📍", info: "ℹ️", list: "📋",
    logout: "🚪", settings: "⚙️", dashboard: "📊", search: "🔍",
  };
  return <span style={{ fontSize: size }}>{icons[name] || "•"}</span>;
};

// ─── CSS ─────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #F7F5F0; color: #1A1A2E; }

  :root {
    --navy: #0D1B3E;
    --navy-mid: #1A2D5A;
    --gold: #C9A84C;
    --gold-light: #E8C97A;
    --cream: #F7F5F0;
    --white: #FFFFFF;
    --gray-100: #F0EEE9;
    --gray-200: #E2DED6;
    --gray-400: #9B9589;
    --gray-600: #635E56;
    --radius: 12px;
    --shadow: 0 4px 24px rgba(13,27,62,0.10);
    --shadow-lg: 0 8px 40px rgba(13,27,62,0.16);
  }

  .app { min-height: 100vh; }

  /* NAV */
  .nav { background: var(--navy); color: var(--white); padding: 0 20px;
    display: flex; align-items: center; justify-content: space-between;
    height: 64px; position: sticky; top: 0; z-index: 100;
    box-shadow: 0 2px 20px rgba(0,0,0,0.3); }
  .nav-brand { display: flex; align-items: center; gap: 10px; }
  .nav-logo { width: 38px; height: 38px; background: var(--gold);
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 16px; color: var(--navy); font-family: 'Playfair Display', serif; }
  .nav-title { font-family: 'Playfair Display', serif; font-size: 17px; letter-spacing: 0.3px; }
  .nav-subtitle { font-size: 10px; color: var(--gold-light); letter-spacing: 1px; text-transform: uppercase; }
  .nav-actions { display: flex; gap: 8px; align-items: center; }
  .nav-btn { background: none; border: 1px solid rgba(255,255,255,0.2); color: var(--white);
    padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 13px;
    transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
  .nav-btn:hover { background: rgba(255,255,255,0.1); }
  .nav-btn.gold { background: var(--gold); border-color: var(--gold); color: var(--navy); font-weight: 600; }
  .nav-btn.gold:hover { background: var(--gold-light); }

  /* TABS */
  .tabs { display: flex; background: var(--navy-mid); padding: 0 20px; overflow-x: auto; }
  .tab { padding: 12px 20px; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 13px;
    border-bottom: 3px solid transparent; white-space: nowrap; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
  .tab:hover { color: rgba(255,255,255,0.9); }
  .tab.active { color: var(--gold); border-bottom-color: var(--gold); }

  /* CONTAINER */
  .container { max-width: 1100px; margin: 0 auto; padding: 24px 16px; }

  /* CARDS */
  .card { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
  .card-header { padding: 20px 24px; border-bottom: 1px solid var(--gray-200);
    display: flex; align-items: center; justify-content: space-between; }
  .card-body { padding: 24px; }
  .card-title { font-family: 'Playfair Display', serif; font-size: 18px; color: var(--navy); }

  /* PROPERTY CARD */
  .prop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
  .prop-card { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow);
    overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
  .prop-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
  .prop-img { width: 100%; height: 200px; object-fit: cover; background: var(--gray-200); display: block; }
  .prop-body { padding: 16px; }
  .prop-id { font-size: 11px; color: var(--gold); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
  .prop-name { font-family: 'Playfair Display', serif; font-size: 17px; color: var(--navy); margin: 4px 0 2px; }
  .prop-addr { font-size: 12px; color: var(--gray-400); display: flex; align-items: center; gap: 4px; margin-bottom: 12px; }
  .prop-price { font-size: 22px; font-weight: 700; color: var(--navy); }
  .prop-price span { font-size: 12px; font-weight: 400; color: var(--gray-400); }
  .prop-details { display: flex; gap: 12px; margin: 10px 0; flex-wrap: wrap; }
  .prop-detail { font-size: 12px; color: var(--gray-600); background: var(--gray-100);
    padding: 3px 8px; border-radius: 20px; }
  .prop-actions { display: flex; gap: 8px; margin-top: 14px; }

  /* BUTTONS */
  .btn { padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer;
    font-size: 14px; font-weight: 500; transition: all 0.2s; display: inline-flex;
    align-items: center; gap: 7px; }
  .btn-primary { background: var(--navy); color: var(--white); }
  .btn-primary:hover { background: var(--navy-mid); }
  .btn-gold { background: var(--gold); color: var(--navy); font-weight: 600; }
  .btn-gold:hover { background: var(--gold-light); }
  .btn-outline { background: none; border: 1.5px solid var(--navy); color: var(--navy); }
  .btn-outline:hover { background: var(--navy); color: var(--white); }
  .btn-danger { background: #DC3545; color: var(--white); }
  .btn-danger:hover { background: #C82333; }
  .btn-sm { padding: 6px 12px; font-size: 12px; }
  .btn-block { width: 100%; justify-content: center; padding: 14px; font-size: 16px; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* BADGE */
  .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge-green { background: #D4EDDA; color: #155724; }
  .badge-red { background: #F8D7DA; color: #721C24; }
  .badge-yellow { background: #FFF3CD; color: #856404; }
  .badge-blue { background: #D1ECF1; color: #0C5460; }

  /* FORMS */
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 500; color: var(--gray-600); margin-bottom: 5px; }
  .form-control { width: 100%; padding: 10px 14px; border: 1.5px solid var(--gray-200);
    border-radius: 8px; font-size: 14px; font-family: 'Inter', sans-serif;
    transition: border-color 0.2s; background: var(--white); color: var(--navy); }
  .form-control:focus { outline: none; border-color: var(--gold); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  textarea.form-control { resize: vertical; min-height: 80px; }
  .form-check { display: flex; align-items: flex-start; gap: 10px; margin-top: 8px; }
  .form-check input { margin-top: 2px; accent-color: var(--gold); }
  .form-check label { font-size: 13px; color: var(--gray-600); }

  /* MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200;
    display: flex; align-items: center; justify-content: center; padding: 16px; }
  .modal { background: var(--white); border-radius: var(--radius); width: 100%;
    max-width: 640px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
  .modal-header { padding: 20px 24px; border-bottom: 1px solid var(--gray-200);
    display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: var(--white); z-index: 1; }
  .modal-body { padding: 24px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--gray-200);
    display: flex; gap: 10px; justify-content: flex-end; }
  .modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: var(--gray-400); }

  /* TABLE */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: var(--gray-100); padding: 10px 14px; text-align: left;
    font-weight: 600; color: var(--gray-600); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 12px 14px; border-bottom: 1px solid var(--gray-100); color: var(--navy); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--cream); }

  /* STEPS */
  .steps { display: flex; gap: 0; margin-bottom: 32px; }
  .step { flex: 1; text-align: center; position: relative; }
  .step::after { content: ''; position: absolute; top: 16px; left: 50%; width: 100%;
    height: 2px; background: var(--gray-200); z-index: 0; }
  .step:last-child::after { display: none; }
  .step-circle { width: 32px; height: 32px; border-radius: 50%; background: var(--gray-200);
    color: var(--gray-400); display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600; margin: 0 auto 6px; position: relative; z-index: 1; }
  .step.active .step-circle { background: var(--gold); color: var(--navy); }
  .step.done .step-circle { background: var(--navy); color: var(--white); }
  .step-label { font-size: 11px; color: var(--gray-400); }
  .step.active .step-label { color: var(--navy); font-weight: 500; }

  /* CALENDAR */
  .cal { background: var(--white); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); }
  .cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .cal-title { font-weight: 600; color: var(--navy); }
  .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
  .cal-day-name { text-align: center; font-size: 11px; font-weight: 600; color: var(--gray-400);
    padding: 4px 0; text-transform: uppercase; }
  .cal-day { text-align: center; padding: 8px 4px; border-radius: 8px; font-size: 13px;
    cursor: pointer; border: 1.5px solid transparent; transition: all 0.15s; }
  .cal-day.empty { cursor: default; }
  .cal-day.available { border-color: var(--gold); color: var(--navy); font-weight: 500; background: rgba(201,168,76,0.08); }
  .cal-day.available:hover { background: var(--gold); color: var(--navy); }
  .cal-day.selected { background: var(--gold); color: var(--navy); font-weight: 700; border-color: var(--gold); }
  .cal-day.past { color: var(--gray-200); cursor: default; }

  /* TIME SLOTS */
  .slots { display: flex; flex-wrap: wrap; gap: 8px; }
  .slot { padding: 8px 16px; border: 1.5px solid var(--gray-200); border-radius: 8px;
    cursor: pointer; font-size: 13px; transition: all 0.15s; }
  .slot:hover { border-color: var(--gold); color: var(--navy); }
  .slot.selected { background: var(--gold); border-color: var(--gold); color: var(--navy); font-weight: 600; }
  .slot.taken { opacity: 0.35; cursor: not-allowed; text-decoration: line-through; }

  /* SUCCESS */
  .success-box { text-align: center; padding: 48px 24px; }
  .success-icon { font-size: 64px; margin-bottom: 16px; }
  .success-title { font-family: 'Playfair Display', serif; font-size: 26px; color: var(--navy); margin-bottom: 8px; }
  .success-msg { color: var(--gray-600); margin-bottom: 24px; line-height: 1.6; }
  .wa-card { background: #E8F5E9; border: 1.5px solid #A5D6A7; border-radius: 10px;
    padding: 16px; text-align: left; margin: 20px 0; font-size: 13px; line-height: 1.8; }
  .wa-card strong { color: #2E7D32; }

  /* HERO */
  .hero { background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 60%, #2A4080 100%);
    color: var(--white); padding: 56px 20px; text-align: center; }
  .hero-eyebrow { font-size: 12px; letter-spacing: 3px; text-transform: uppercase;
    color: var(--gold); margin-bottom: 12px; }
  .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 5vw, 48px);
    line-height: 1.15; margin-bottom: 12px; }
  .hero-sub { font-size: 16px; color: rgba(255,255,255,0.7); max-width: 520px; margin: 0 auto 28px; }

  /* STATUS SELECT */
  .status-select { padding: 4px 8px; border-radius: 6px; border: 1.5px solid var(--gray-200);
    font-size: 12px; font-weight: 600; cursor: pointer; }

  /* WA FLOAT */
  .wa-float { position: fixed; bottom: 24px; right: 20px; z-index: 150;
    background: #25D366; color: white; width: 56px; height: 56px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-size: 26px;
    box-shadow: 0 4px 20px rgba(37,211,102,0.4); cursor: pointer; text-decoration: none;
    transition: transform 0.2s; }
  .wa-float:hover { transform: scale(1.1); }

  /* PHOTO GALLERY */
  .photo-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; margin-top: 12px; }
  .photo-thumb { position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; }
  .photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .photo-del { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7);
    color: white; border: none; border-radius: 50%; width: 22px; height: 22px;
    cursor: pointer; font-size: 11px; display: flex; align-items: center; justify-content: center; }

  /* TOGGLE */
  .toggle { position: relative; display: inline-block; width: 44px; height: 24px; }
  .toggle input { opacity: 0; width: 0; height: 0; }
  .toggle-slider { position: absolute; cursor: pointer; inset: 0; background: var(--gray-200);
    border-radius: 24px; transition: 0.3s; }
  .toggle-slider::before { content: ''; position: absolute; width: 18px; height: 18px;
    left: 3px; top: 3px; background: white; border-radius: 50%; transition: 0.3s; }
  input:checked + .toggle-slider { background: var(--gold); }
  input:checked + .toggle-slider::before { transform: translateX(20px); }

  /* SUMMARY */
  .summary-box { background: var(--gray-100); border-radius: 10px; padding: 16px; margin-bottom: 20px; }
  .summary-row { display: flex; justify-content: space-between; padding: 5px 0;
    border-bottom: 1px solid var(--gray-200); font-size: 13px; }
  .summary-row:last-child { border-bottom: none; font-weight: 600; color: var(--navy); }

  /* LOGIN */
  .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, var(--navy), var(--navy-mid)); }
  .login-box { background: var(--white); border-radius: 16px; padding: 40px; width: 100%; max-width: 380px; box-shadow: var(--shadow-lg); }
  .login-logo { text-align: center; margin-bottom: 28px; }
  .login-logo-mark { width: 60px; height: 60px; background: var(--gold); border-radius: 14px;
    display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;
    font-family: 'Playfair Display', serif; font-size: 26px; color: var(--navy); font-weight: 700; }
  .login-title { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--navy); }
  .login-sub { font-size: 13px; color: var(--gray-400); }

  /* STAT CARDS */
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .stat-card { background: var(--white); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); }
  .stat-label { font-size: 12px; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .stat-value { font-size: 28px; font-weight: 700; color: var(--navy); font-family: 'Playfair Display', serif; }
  .stat-sub { font-size: 12px; color: var(--gray-400); margin-top: 2px; }

  /* RESPONSIVE */
  @media (max-width: 640px) {
    .form-row, .form-row-3 { grid-template-columns: 1fr; }
    .nav-title { font-size: 14px; }
    .tabs { font-size: 12px; }
    .tab { padding: 10px 12px; }
    .stat-grid { grid-template-columns: 1fr 1fr; }
  }

  .section-title { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--navy); margin-bottom: 4px; }
  .section-sub { font-size: 14px; color: var(--gray-400); margin-bottom: 20px; }
  .divider { height: 1px; background: var(--gray-200); margin: 24px 0; }
  .text-gold { color: var(--gold); }
  .text-navy { color: var(--navy); }
  .text-sm { font-size: 12px; }
  .text-muted { color: var(--gray-400); }
  .mt-2 { margin-top: 8px; }
  .mt-4 { margin-top: 16px; }
  .flex { display: flex; }
  .flex-center { display: flex; align-items: center; }
  .gap-2 { gap: 8px; }
  .gap-3 { gap: 12px; }
  .justify-between { justify-content: space-between; }
  .alert { padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
  .alert-danger { background: #F8D7DA; color: #721C24; border: 1px solid #F5C6CB; }
  .alert-success { background: #D4EDDA; color: #155724; border: 1px solid #C3E6CB; }
`;

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState("dashboard");
  const [clientStep, setClientStep] = useState(0);
  const [view, setView] = useState("client"); // "client" | "admin" | "login"

  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [bookings, setBookings] = useState([
    {
      id: "BK001", propertyId: "BSF001", propertyLabel: "Casa – Rua das Acácias, 142",
      name: "Maria Oliveira", cpf: "123.456.789-00", phone: "(27) 99999-1111",
      email: "maria@email.com", people: 2, date: "2026-06-15", time: "09:00",
      status: "Confirmada", obs: "", createdAt: "2026-06-10",
    },
    {
      id: "BK002", propertyId: "BSF002", propertyLabel: "Apto – Av. Brasil, 890",
      name: "João Santos", cpf: "987.654.321-00", phone: "(27) 98888-2222",
      email: "joao@email.com", people: 3, date: "2026-06-16", time: "14:00",
      status: "Pendente", obs: "Tenho pet", createdAt: "2026-06-11",
    },
  ]);

  // Client schedule state
  const [selectedProp, setSelectedProp] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [clientForm, setClientForm] = useState({ name:"", cpf:"", phone:"", email:"", people:1, obs:"", lgpd:false });
  const [bookingDone, setBookingDone] = useState(null);

  // Admin state
  const [loginForm, setLoginForm] = useState({ user:"", pass:"", error:"" });
  const [propModal, setPropModal] = useState(null); // null | {mode, data}
  const [scheduleModal, setScheduleModal] = useState(false);
  const [slotForm, setSlotForm] = useState({ date:"", times:"" });

  const takenSlots = (date) =>
    bookings.filter(b => b.date === date && b.status !== "Cancelada").map(b => b.time);

  const handleLogin = () => {
    if (loginForm.user === ADMIN_CREDENTIALS.user && loginForm.pass === ADMIN_CREDENTIALS.pass) {
      setIsAdmin(true); setView("admin");
    } else {
      setLoginForm(f => ({...f, error: "Usuário ou senha incorretos."}));
    }
  };

  const handleBooking = () => {
    const prop = properties.find(p => p.id === selectedProp);
    const bk = {
      id: "BK" + Date.now(),
      propertyId: selectedProp,
      propertyLabel: `${prop.type} – ${prop.address}`,
      name: clientForm.name, cpf: clientForm.cpf, phone: clientForm.phone,
      email: clientForm.email, people: clientForm.people, obs: clientForm.obs,
      date: selectedDate, time: selectedTime, status: "Pendente",
      createdAt: today(),
    };
    setBookings(prev => [bk, ...prev]);
    setBookingDone(bk);
    setClientStep(4);
  };

  const updateBookingStatus = (id, status) => {
    setBookings(prev => prev.map(b => b.id === id ? {...b, status} : b));
  };

  const saveProp = (data) => {
    if (data.id && properties.find(p => p.id === data.id)) {
      setProperties(prev => prev.map(p => p.id === data.id ? {...p, ...data} : p));
    } else {
      setProperties(prev => [...prev, { ...data, id: "BSF" + Date.now(), photos: [], active: true }]);
    }
    setPropModal(null);
  };

  const deleteProp = (id) => {
    if (confirm("Remover este imóvel?")) setProperties(prev => prev.filter(p => p.id !== id));
  };

  const toggleProp = (id) => {
    setProperties(prev => prev.map(p => p.id === id ? {...p, active: !p.active} : p));
  };

  const addSlots = () => {
    const times = slotForm.times.split(",").map(t => t.trim()).filter(Boolean);
    setSlots(prev => ({...prev, [slotForm.date]: [...(prev[slotForm.date] || []), ...times]}));
    setSlotForm({ date:"", times:"" });
    setScheduleModal(false);
  };

  const todayBookings = bookings.filter(b => b.date === today());
  const upcomingBookings = bookings.filter(b => b.date > today() && b.status !== "Cancelada");

  // Reset client flow
  const resetClient = () => {
    setClientStep(0); setSelectedProp(null); setSelectedDate(""); setSelectedTime("");
    setClientForm({ name:"", cpf:"", phone:"", email:"", people:1, obs:"", lgpd:false });
    setBookingDone(null);
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">

        {/* WA FLOAT BUTTON */}
        <a href="https://wa.me/5527998032142" className="wa-float" target="_blank" rel="noreferrer">💬</a>

        {/* ── LOGIN ── */}
        {view === "login" && (
          <div className="login-wrap">
            <div className="login-box">
              <div className="login-logo">
                <div className="login-logo-mark">B+</div>
                <div className="login-title">Área Administrativa</div>
                <div className="login-sub">Barra Mais Imóveis</div>
              </div>
              {loginForm.error && <div className="alert alert-danger">{loginForm.error}</div>}
              <div className="form-group">
                <label className="form-label">Usuário</label>
                <input className="form-control" value={loginForm.user}
                  onChange={e => setLoginForm(f => ({...f, user: e.target.value, error:""}))}
                  placeholder="admin" />
              </div>
              <div className="form-group">
                <label className="form-label">Senha</label>
                <input className="form-control" type="password" value={loginForm.pass}
                  onChange={e => setLoginForm(f => ({...f, pass: e.target.value, error:""}))}
                  placeholder="••••••••"
                  onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
              <button className="btn btn-primary btn-block mt-4" onClick={handleLogin}>Entrar</button>
              <div style={{textAlign:"center",marginTop:16}}>
                <button className="btn btn-outline btn-sm" onClick={() => setView("client")}>← Ver site público</button>
              </div>
              <div style={{textAlign:"center",marginTop:12,fontSize:12,color:"#999"}}>
                Demo: admin / barra2024
              </div>
            </div>
          </div>
        )}

        {/* ── ADMIN ── */}
        {view === "admin" && isAdmin && (
          <>
            <nav className="nav">
              <div className="nav-brand">
                <div className="nav-logo">B+</div>
                <div>
                  <div className="nav-title">Barra Mais Imóveis</div>
                  <div className="nav-subtitle">Painel Administrativo</div>
                </div>
              </div>
              <div className="nav-actions">
                <button className="nav-btn" onClick={() => setView("client")}>🌐 Ver Site</button>
                <button className="nav-btn" onClick={() => { setIsAdmin(false); setView("client"); }}>🚪 Sair</button>
              </div>
            </nav>

            <div className="tabs">
              {[["dashboard","📊 Dashboard"],["properties","🏠 Imóveis"],["schedule","📅 Agenda"],["visits","📋 Visitas"]].map(([k,l]) => (
                <div key={k} className={`tab ${adminTab===k?"active":""}`} onClick={() => setAdminTab(k)}>{l}</div>
              ))}
            </div>

            <div className="container">

              {/* DASHBOARD */}
              {adminTab === "dashboard" && (
                <>
                  <div style={{marginBottom:20}}>
                    <div className="section-title">Visão Geral</div>
                    <div className="section-sub">Resumo das atividades da imobiliária</div>
                  </div>
                  <div className="stat-grid">
                    {[
                      {label:"Imóveis Ativos", value: properties.filter(p=>p.active).length, sub:"disponíveis para locação"},
                      {label:"Visitas Hoje", value: todayBookings.length, sub:"agendamentos para hoje"},
                      {label:"Próximas Visitas", value: upcomingBookings.length, sub:"nos próximos dias"},
                      {label:"Total de Visitas", value: bookings.length, sub:"histórico completo"},
                    ].map(s => (
                      <div className="stat-card" key={s.label}>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-sub">{s.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div className="card">
                    <div className="card-header"><div className="card-title">Visitas de Hoje</div></div>
                    <div className="card-body">
                      {todayBookings.length === 0 ? (
                        <div style={{textAlign:"center",color:"#999",padding:"24px 0"}}>Nenhuma visita agendada para hoje.</div>
                      ) : (
                        <div className="table-wrap">
                          <table>
                            <thead><tr><th>Horário</th><th>Cliente</th><th>Imóvel</th><th>Status</th></tr></thead>
                            <tbody>
                              {todayBookings.map(b => (
                                <tr key={b.id}>
                                  <td><strong>{b.time}</strong></td>
                                  <td>{b.name}<br/><span className="text-muted text-sm">{b.phone}</span></td>
                                  <td>{b.propertyLabel}</td>
                                  <td>
                                    <span className="badge" style={{background:STATUS_COLORS[b.status]?.bg, color:STATUS_COLORS[b.status]?.text}}>{b.status}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* PROPERTIES */}
              {adminTab === "properties" && (
                <>
                  <div className="flex justify-between" style={{alignItems:"center",marginBottom:20}}>
                    <div>
                      <div className="section-title">Gerenciar Imóveis</div>
                      <div className="section-sub">{properties.length} imóveis cadastrados</div>
                    </div>
                    <button className="btn btn-gold" onClick={() => setPropModal({mode:"new", data:{}})}>➕ Novo Imóvel</button>
                  </div>
                  <div className="table-wrap card">
                    <table>
                      <thead><tr><th>Código</th><th>Tipo</th><th>Endereço</th><th>Aluguel</th><th>Visitas</th><th>Status</th><th>Ações</th></tr></thead>
                      <tbody>
                        {properties.map(p => (
                          <tr key={p.id}>
                            <td><strong>{p.id}</strong></td>
                            <td>{p.type}</td>
                            <td>{p.address}<br/><span className="text-muted text-sm">{p.neighborhood}</span></td>
                            <td>{fmt(p.rent)}</td>
                            <td>
                              <label className="toggle">
                                <input type="checkbox" checked={p.availableForScheduling}
                                  onChange={() => setProperties(prev => prev.map(x => x.id===p.id ? {...x,availableForScheduling:!x.availableForScheduling}:x))} />
                                <span className="toggle-slider"></span>
                              </label>
                            </td>
                            <td>
                              <span className={`badge ${p.active?"badge-green":"badge-red"}`}>{p.active?"Ativo":"Inativo"}</span>
                            </td>
                            <td>
                              <div style={{display:"flex",gap:6}}>
                                <button className="btn btn-outline btn-sm" onClick={() => setPropModal({mode:"edit",data:{...p}})}>✏️</button>
                                <button className="btn btn-sm" style={{background:p.active?"#FFF3CD":"#D4EDDA",color:p.active?"#856404":"#155724"}}
                                  onClick={() => toggleProp(p.id)}>{p.active?"⏸":"▶"}</button>
                                <button className="btn btn-danger btn-sm" onClick={() => deleteProp(p.id)}>🗑️</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* SCHEDULE MANAGER */}
              {adminTab === "schedule" && (
                <>
                  <div className="flex justify-between" style={{alignItems:"center",marginBottom:20}}>
                    <div>
                      <div className="section-title">Gerenciar Agenda</div>
                      <div className="section-sub">Dias e horários disponíveis para visitas</div>
                    </div>
                    <button className="btn btn-gold" onClick={() => setScheduleModal(true)}>➕ Adicionar Horários</button>
                  </div>
                  <div className="card">
                    <div className="card-body">
                      {Object.entries(slots).sort().map(([date, times]) => (
                        <div key={date} style={{marginBottom:16,paddingBottom:16,borderBottom:"1px solid #E2DED6"}}>
                          <div className="flex justify-between" style={{alignItems:"center",marginBottom:8}}>
                            <strong style={{color:"#0D1B3E"}}>{fmtDate(date)}</strong>
                            <button className="btn btn-danger btn-sm" onClick={() => setSlots(prev => { const n={...prev}; delete n[date]; return n; })}>Remover dia</button>
                          </div>
                          <div className="slots">
                            {times.map(t => {
                              const isTaken = takenSlots(date).includes(t);
                              return (
                                <div key={t} style={{display:"flex",alignItems:"center",gap:4}}>
                                  <span className={`slot ${isTaken?"taken":""}`}>{t}</span>
                                  {!isTaken && <button style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#DC3545"}}
                                    onClick={() => setSlots(prev => ({...prev,[date]:prev[date].filter(x=>x!==t)}))}>✕</button>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* VISITS */}
              {adminTab === "visits" && (
                <>
                  <div style={{marginBottom:20}}>
                    <div className="section-title">Painel de Visitas</div>
                    <div className="section-sub">Todos os agendamentos realizados</div>
                  </div>
                  <div className="card">
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr><th>ID</th><th>Cliente</th><th>Imóvel</th><th>Data/Hora</th><th>Pessoas</th><th>Status</th><th>Ação</th></tr>
                        </thead>
                        <tbody>
                          {[...bookings].sort((a,b) => b.date.localeCompare(a.date)).map(b => (
                            <tr key={b.id}>
                              <td><span className="text-muted text-sm">{b.id}</span></td>
                              <td>
                                <strong>{b.name}</strong><br/>
                                <span className="text-muted text-sm">{b.phone}</span><br/>
                                <span className="text-muted text-sm">{b.email}</span>
                              </td>
                              <td>{b.propertyLabel}</td>
                              <td><strong>{fmtDate(b.date)}</strong> às {b.time}</td>
                              <td style={{textAlign:"center"}}>{b.people}</td>
                              <td>
                                <span className="badge" style={{background:STATUS_COLORS[b.status]?.bg,color:STATUS_COLORS[b.status]?.text}}>
                                  {b.status}
                                </span>
                              </td>
                              <td>
                                <select className="status-select" value={b.status} onChange={e => updateBookingStatus(b.id, e.target.value)}>
                                  {["Pendente","Confirmada","Realizada","Cancelada"].map(s => <option key={s}>{s}</option>)}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* PROPERTY MODAL */}
            {propModal && <PropertyModal mode={propModal.mode} data={propModal.data} onSave={saveProp} onClose={() => setPropModal(null)} />}

            {/* SLOT MODAL */}
            {scheduleModal && (
              <div className="modal-overlay" onClick={() => setScheduleModal(false)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <span className="card-title">Adicionar Horários</span>
                    <button className="modal-close" onClick={() => setScheduleModal(false)}>×</button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label className="form-label">Data</label>
                      <input type="date" className="form-control" value={slotForm.date}
                        onChange={e => setSlotForm(f => ({...f, date: e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Horários (separados por vírgula)</label>
                      <input className="form-control" value={slotForm.times} placeholder="09:00, 10:00, 14:00, 15:00"
                        onChange={e => setSlotForm(f => ({...f, times: e.target.value}))} />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-outline" onClick={() => setScheduleModal(false)}>Cancelar</button>
                    <button className="btn btn-gold" onClick={addSlots} disabled={!slotForm.date || !slotForm.times}>Salvar</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── CLIENT SITE ── */}
        {view === "client" && (
          <>
            <nav className="nav">
              <div className="nav-brand">
                <div className="nav-logo">B+</div>
                <div>
                  <div className="nav-title">Barra Mais Imóveis</div>
                  <div className="nav-subtitle">CRECI-ES 011066-F</div>
                </div>
              </div>
              <div className="nav-actions">
                <button className="nav-btn" onClick={() => setView("login")}>🔑 Admin</button>
              </div>
            </nav>

            {clientStep === 0 && (
              <>
                <div className="hero">
                  <div className="hero-eyebrow">Barra de São Francisco · ES</div>
                  <h1 className="hero-title">Encontre seu próximo imóvel<br/>e agende uma visita</h1>
                  <p className="hero-sub">Selecione o imóvel, escolha data e horário, e nossa equipe confirmará sua visita.</p>
                </div>
                <div className="container">
                  <div style={{marginBottom:16}}>
                    <div className="section-title">Imóveis Disponíveis</div>
                    <div className="section-sub">{properties.filter(p=>p.active && p.availableForScheduling).length} imóveis com agendamento disponível</div>
                  </div>
                  <div className="prop-grid">
                    {properties.filter(p => p.active && p.availableForScheduling).map(p => (
                      <PropertyCard key={p.id} prop={p} onSchedule={() => { setSelectedProp(p.id); setClientStep(1); }} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {clientStep === 1 && selectedProp && (
              <ClientStep1
                prop={properties.find(p => p.id === selectedProp)}
                onNext={() => setClientStep(2)}
                onBack={resetClient}
              />
            )}

            {clientStep === 2 && (
              <ClientStep2
                slots={slots}
                takenSlots={takenSlots}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSelectDate={setSelectedDate}
                onSelectTime={setSelectedTime}
                onNext={() => setClientStep(3)}
                onBack={() => setClientStep(1)}
              />
            )}

            {clientStep === 3 && (
              <ClientStep3
                prop={properties.find(p => p.id === selectedProp)}
                date={selectedDate}
                time={selectedTime}
                form={clientForm}
                setForm={setClientForm}
                onConfirm={handleBooking}
                onBack={() => setClientStep(2)}
              />
            )}

            {clientStep === 4 && bookingDone && (
              <div className="container">
                <div className="card">
                  <div className="success-box">
                    <div className="success-icon">✅</div>
                    <div className="success-title">Visita Agendada com Sucesso!</div>
                    <p className="success-msg">
                      A equipe da Barra Mais Imóveis recebeu sua solicitação e confirmará em breve.<br/>
                      Você receberá confirmação pelo WhatsApp informado.
                    </p>
                    <div className="wa-card">
                      <strong>📋 Resumo do Agendamento</strong><br/>
                      <strong>Cliente:</strong> {bookingDone.name}<br/>
                      <strong>Telefone:</strong> {bookingDone.phone}<br/>
                      <strong>Imóvel:</strong> {bookingDone.propertyLabel}<br/>
                      <strong>Data:</strong> {fmtDate(bookingDone.date)}<br/>
                      <strong>Horário:</strong> {bookingDone.time}<br/>
                      <strong>Pessoas:</strong> {bookingDone.people}
                    </div>
                    <a
                      href={`https://wa.me/5527998032142?text=${encodeURIComponent(`Olá! Acabei de agendar uma visita pelo site.\n\nCliente: ${bookingDone.name}\nTelefone: ${bookingDone.phone}\nImóvel: ${bookingDone.propertyLabel}\nData: ${fmtDate(bookingDone.date)}\nHorário: ${bookingDone.time}`)}`}
                      target="_blank" rel="noreferrer"
                      className="btn btn-gold" style={{display:"inline-flex",gap:8,marginBottom:12}}>
                      💬 Confirmar pelo WhatsApp
                    </a>
                    <br/>
                    <button className="btn btn-outline" onClick={resetClient}>← Agendar outra visita</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ─── PROPERTY CARD (PUBLIC) ──────────────────────────────────────────────────
function PropertyCard({ prop, onSchedule }) {
  return (
    <div className="prop-card">
      <img className="prop-img" src={prop.photos[0] || "https://via.placeholder.com/400x200?text=Sem+Foto"} alt={prop.type} />
      <div className="prop-body">
        <div className="prop-id">{prop.id} · {prop.type}</div>
        <div className="prop-name">{prop.address}</div>
        <div className="prop-addr">📍 {prop.neighborhood} – {prop.city}</div>
        <div className="prop-price">{`R$ ${prop.rent.toLocaleString("pt-BR")}`}<span>/mês</span></div>
        {prop.condo > 0 && <div style={{fontSize:12,color:"#9B9589",marginTop:2}}>+ Condomínio: R$ {prop.condo.toLocaleString("pt-BR")}</div>}
        <div className="prop-details">
          {prop.rooms > 0 && <span className="prop-detail">🛏 {prop.rooms} Quartos</span>}
          {prop.suites > 0 && <span className="prop-detail">🛁 {prop.suites} Suíte{prop.suites>1?"s":""}</span>}
          {prop.bathrooms > 0 && <span className="prop-detail">🚿 {prop.bathrooms} Banheiro{prop.bathrooms>1?"s":""}</span>}
          {prop.parking > 0 && <span className="prop-detail">🚗 {prop.parking} Vaga{prop.parking>1?"s":""}</span>}
        </div>
        <p style={{fontSize:13,color:"#635E56",margin:"10px 0",lineHeight:1.5}}>{prop.description}</p>
        <button className="btn btn-gold btn-block" onClick={onSchedule}>📅 Agendar Visita</button>
      </div>
    </div>
  );
}

// ─── CLIENT STEP 1: Property Detail ─────────────────────────────────────────
function ClientStep1({ prop, onNext, onBack }) {
  const [photo, setPhoto] = useState(0);
  return (
    <div className="container">
      <div style={{marginBottom:16}}>
        <button className="btn btn-outline btn-sm" onClick={onBack}>← Voltar</button>
      </div>
      <div className="card">
        <div style={{position:"relative"}}>
          <img src={prop.photos[photo] || "https://via.placeholder.com/800x400?text=Sem+Foto"} alt=""
            style={{width:"100%",height:320,objectFit:"cover"}} />
          {prop.photos.length > 1 && (
            <div style={{position:"absolute",bottom:12,right:12,display:"flex",gap:6}}>
              {prop.photos.map((_, i) => (
                <div key={i} onClick={() => setPhoto(i)}
                  style={{width:10,height:10,borderRadius:"50%",background:i===photo?"#C9A84C":"rgba(255,255,255,0.7)",cursor:"pointer"}} />
              ))}
            </div>
          )}
        </div>
        <div className="card-body">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{fontSize:11,color:"#C9A84C",fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>{prop.id} · {prop.type}</div>
              <h2 style={{fontFamily:"Playfair Display, serif",fontSize:24,color:"#0D1B3E",margin:"4px 0"}}>{prop.address}</h2>
              <div style={{fontSize:13,color:"#9B9589"}}>📍 {prop.neighborhood} – {prop.city}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:28,fontWeight:700,color:"#0D1B3E"}}>R$ {prop.rent.toLocaleString("pt-BR")}<span style={{fontSize:14,fontWeight:400,color:"#9B9589"}}>/mês</span></div>
              {prop.condo > 0 && <div style={{fontSize:13,color:"#9B9589"}}>Cond.: R$ {prop.condo.toLocaleString("pt-BR")}</div>}
            </div>
          </div>
          <div className="divider" />
          <div className="prop-details" style={{marginBottom:16}}>
            {prop.rooms > 0 && <span className="prop-detail">🛏 {prop.rooms} Quartos</span>}
            {prop.suites > 0 && <span className="prop-detail">🛁 {prop.suites} Suíte{prop.suites>1?"s":""}</span>}
            {prop.bathrooms > 0 && <span className="prop-detail">🚿 {prop.bathrooms} Banheiro{prop.bathrooms>1?"s":""}</span>}
            {prop.parking > 0 && <span className="prop-detail">🚗 {prop.parking} Vaga{prop.parking>1?"s":""}</span>}
          </div>
          <p style={{fontSize:14,lineHeight:1.7,color:"#635E56",marginBottom:16}}>{prop.description}</p>
          {prop.visitNotes && (
            <div style={{background:"#FFF3CD",border:"1px solid #FFECB5",borderRadius:8,padding:"12px 16px",fontSize:13,color:"#856404"}}>
              ℹ️ <strong>Observações para visita:</strong> {prop.visitNotes}
            </div>
          )}
          <div className="divider" />
          <button className="btn btn-gold btn-block" onClick={onNext}>📅 Escolher Data e Horário →</button>
        </div>
      </div>
    </div>
  );
}

// ─── CLIENT STEP 2: Date/Time ─────────────────────────────────────────────────
function ClientStep2({ slots, takenSlots, selectedDate, selectedTime, onSelectDate, onSelectTime, onNext, onBack }) {
  const [calMonth, setCalMonth] = useState(() => {
    const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() };
  });

  const daysInMonth = new Date(calMonth.y, calMonth.m+1, 0).getDate();
  const firstDay = new Date(calMonth.y, calMonth.m, 1).getDay();
  const monthName = new Date(calMonth.y, calMonth.m, 1).toLocaleString("pt-BR",{month:"long",year:"numeric"});
  const todayStr = new Date().toISOString().split("T")[0];

  const dayStr = (d) => {
    const mm = String(calMonth.m+1).padStart(2,"0");
    const dd = String(d).padStart(2,"0");
    return `${calMonth.y}-${mm}-${dd}`;
  };

  return (
    <div className="container">
      <div style={{marginBottom:16}}>
        <button className="btn btn-outline btn-sm" onClick={onBack}>← Voltar</button>
      </div>
      <div className="steps">
        {["Imóvel","Data/Hora","Seus Dados","Confirmação"].map((s,i) => (
          <div key={s} className={`step ${i===1?"active":i<1?"done":""}`}>
            <div className="step-circle">{i<1?"✓":i+1}</div>
            <div className="step-label">{s}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}} className="responsive-grid">
        <div className="cal">
          <div className="cal-header">
            <button className="btn btn-outline btn-sm" onClick={() => setCalMonth(c => {
              const d = new Date(c.y,c.m-1); return {y:d.getFullYear(),m:d.getMonth()};
            })}>‹</button>
            <span className="cal-title" style={{textTransform:"capitalize"}}>{monthName}</span>
            <button className="btn btn-outline btn-sm" onClick={() => setCalMonth(c => {
              const d = new Date(c.y,c.m+1); return {y:d.getFullYear(),m:d.getMonth()};
            })}>›</button>
          </div>
          <div className="cal-grid">
            {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d => (
              <div key={d} className="cal-day-name">{d}</div>
            ))}
            {Array(firstDay).fill(null).map((_,i) => <div key={`e${i}`} className="cal-day empty" />)}
            {Array(daysInMonth).fill(null).map((_,i) => {
              const d = i+1, ds = dayStr(d);
              const avail = !!slots[ds];
              const past = ds < todayStr;
              const sel = ds === selectedDate;
              return (
                <div key={d} className={`cal-day ${past?"past":avail?"available":""} ${sel?"selected":""}`}
                  onClick={() => { if(avail && !past) { onSelectDate(ds); onSelectTime(""); } }}>
                  {d}
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className="card" style={{padding:20}}>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:17,color:"#0D1B3E",marginBottom:12}}>
              {selectedDate ? `Horários – ${new Date(selectedDate+"T12:00:00").toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})}` : "Selecione uma data no calendário"}
            </div>
            {selectedDate && (
              <div className="slots">
                {(slots[selectedDate] || []).map(t => {
                  const taken = takenSlots(selectedDate).includes(t);
                  return (
                    <div key={t} className={`slot ${taken?"taken":""} ${t===selectedTime?"selected":""}`}
                      onClick={() => !taken && onSelectTime(t)}>
                      {t}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {selectedDate && selectedTime && (
            <div className="alert alert-success" style={{marginTop:16}}>
              ✅ <strong>{selectedDate && new Date(selectedDate+"T12:00:00").toLocaleDateString("pt-BR",{day:"numeric",month:"long"})}</strong> às <strong>{selectedTime}</strong> selecionado.
            </div>
          )}
          <button className="btn btn-gold btn-block" style={{marginTop:16}} disabled={!selectedDate || !selectedTime} onClick={onNext}>
            Continuar → Meus Dados
          </button>
        </div>
      </div>
      <style>{`@media(max-width:640px){.responsive-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}

// ─── CLIENT STEP 3: Form ──────────────────────────────────────────────────────
function ClientStep3({ prop, date, time, form, setForm, onConfirm, onBack }) {
  const valid = form.name && form.cpf && form.phone && form.email && form.lgpd;
  const f = (k) => (e) => setForm(prev => ({...prev, [k]: e.target.value}));
  return (
    <div className="container">
      <div style={{marginBottom:16}}>
        <button className="btn btn-outline btn-sm" onClick={onBack}>← Voltar</button>
      </div>
      <div className="steps">
        {["Imóvel","Data/Hora","Seus Dados","Confirmação"].map((s,i) => (
          <div key={s} className={`step ${i===2?"active":i<2?"done":""}`}>
            <div className="step-circle">{i<2?"✓":i+1}</div>
            <div className="step-label">{s}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:20}} className="responsive-grid2">
        <div className="card">
          <div className="card-header"><div className="card-title">Seus Dados</div></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Nome completo *</label>
              <input className="form-control" value={form.name} onChange={f("name")} placeholder="Seu nome completo" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">CPF *</label>
                <input className="form-control" value={form.cpf} onChange={f("cpf")} placeholder="000.000.000-00" />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp *</label>
                <input className="form-control" value={form.phone} onChange={f("phone")} placeholder="(27) 99999-0000" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">E-mail *</label>
              <input className="form-control" type="email" value={form.email} onChange={f("email")} placeholder="seu@email.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Quantidade de pessoas na visita</label>
              <select className="form-control" value={form.people} onChange={f("people")}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} pessoa{n>1?"s":""}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Observações (opcional)</label>
              <textarea className="form-control" value={form.obs} onChange={f("obs")} placeholder="Alguma observação sobre a visita?" />
            </div>
            <div className="form-check">
              <input type="checkbox" id="lgpd" checked={form.lgpd} onChange={e => setForm(p => ({...p,lgpd:e.target.checked}))} />
              <label htmlFor="lgpd">Autorizo a Barra Mais Imóveis a utilizar meus dados para contato referente ao agendamento conforme a LGPD (Lei 13.709/2018).</label>
            </div>
          </div>
        </div>
        <div>
          <div className="card" style={{padding:20,marginBottom:16}}>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:16,color:"#0D1B3E",marginBottom:12}}>Resumo da Visita</div>
            <div className="summary-box">
              <div className="summary-row"><span>Imóvel</span><span style={{fontSize:12}}>{prop?.type} – {prop?.neighborhood}</span></div>
              <div className="summary-row"><span>Data</span><span><strong>{date && new Date(date+"T12:00:00").toLocaleDateString("pt-BR",{day:"numeric",month:"long"})}</strong></span></div>
              <div className="summary-row"><span>Horário</span><span><strong>{time}</strong></span></div>
              <div className="summary-row"><span>Aluguel</span><span>R$ {prop?.rent.toLocaleString("pt-BR")}/mês</span></div>
            </div>
          </div>
          <button className="btn btn-gold btn-block" disabled={!valid} onClick={onConfirm}>
            ✅ Confirmar Agendamento
          </button>
          {!form.lgpd && <p style={{fontSize:11,color:"#DC3545",marginTop:8,textAlign:"center"}}>Aceite o termo LGPD para continuar.</p>}
        </div>
      </div>
      <style>{`@media(max-width:640px){.responsive-grid2{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}

// ─── PROPERTY MODAL (ADMIN) ──────────────────────────────────────────────────
function PropertyModal({ mode, data, onSave, onClose }) {
  const [form, setForm] = useState({
    id: data.id || "", type: data.type || "Casa", address: data.address || "",
    neighborhood: data.neighborhood || "", city: data.city || "Barra de São Francisco",
    rent: data.rent || "", condo: data.condo || 0, rooms: data.rooms || 0,
    suites: data.suites || 0, bathrooms: data.bathrooms || 1, parking: data.parking || 0,
    description: data.description || "", visitNotes: data.visitNotes || "",
    photos: data.photos || [], active: data.active !== false, availableForScheduling: data.availableForScheduling !== false,
  });
  const [newPhoto, setNewPhoto] = useState("");
  const f = (k) => (e) => setForm(p => ({...p, [k]: e.target.value}));
  const addPhoto = () => { if(newPhoto) { setForm(p => ({...p, photos:[...p.photos, newPhoto]})); setNewPhoto(""); } };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="card-title">{mode==="new"?"Novo Imóvel":"Editar Imóvel"}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Código do Imóvel</label>
              <input className="form-control" value={form.id} onChange={f("id")} placeholder="BSF001" disabled={mode==="edit"} />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select className="form-control" value={form.type} onChange={f("type")}>
                {["Casa","Apartamento","Sala Comercial","Loja","Terreno"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Endereço Completo</label>
            <input className="form-control" value={form.address} onChange={f("address")} placeholder="Rua, número, complemento" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Bairro</label>
              <input className="form-control" value={form.neighborhood} onChange={f("neighborhood")} />
            </div>
            <div className="form-group">
              <label className="form-label">Cidade</label>
              <input className="form-control" value={form.city} onChange={f("city")} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Valor do Aluguel (R$)</label>
              <input className="form-control" type="number" value={form.rent} onChange={f("rent")} />
            </div>
            <div className="form-group">
              <label className="form-label">Condomínio (R$)</label>
              <input className="form-control" type="number" value={form.condo} onChange={f("condo")} />
            </div>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Quartos</label>
              <input className="form-control" type="number" value={form.rooms} onChange={f("rooms")} min={0} />
            </div>
            <div className="form-group">
              <label className="form-label">Suítes</label>
              <input className="form-control" type="number" value={form.suites} onChange={f("suites")} min={0} />
            </div>
            <div className="form-group">
              <label className="form-label">Banheiros</label>
              <input className="form-control" type="number" value={form.bathrooms} onChange={f("bathrooms")} min={0} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Vagas de Garagem</label>
            <input className="form-control" type="number" value={form.parking} onChange={f("parking")} min={0} />
          </div>
          <div className="form-group">
            <label className="form-label">Descrição Completa</label>
            <textarea className="form-control" value={form.description} onChange={f("description")} rows={3} />
          </div>
          <div className="form-group">
            <label className="form-label">Observações para Visita</label>
            <textarea className="form-control" value={form.visitNotes} onChange={f("visitNotes")} rows={2} />
          </div>
          <div className="form-group">
            <label className="form-label">Fotos (URL)</label>
            <div style={{display:"flex",gap:8}}>
              <input className="form-control" value={newPhoto} onChange={e=>setNewPhoto(e.target.value)} placeholder="https://..." />
              <button className="btn btn-outline" onClick={addPhoto}>+</button>
            </div>
            <div className="photo-gallery">
              {form.photos.map((ph,i) => (
                <div key={i} className="photo-thumb">
                  <img src={ph} alt="" />
                  <button className="photo-del" onClick={() => setForm(p=>({...p,photos:p.photos.filter((_,j)=>j!==i)}))}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-gold" onClick={() => onSave(form)}>Salvar Imóvel</button>
        </div>
      </div>
    </div>
  );
}
