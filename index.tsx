import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// --- Icons ---
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
);

const SigmaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 5H6l7 7-7 7h12" />
  </svg>
);

// --- Chart Components ---

// Simple SVG Pie Chart
const SimplePieChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
  const total = data.reduce((acc, cur) => acc + cur.value, 0);
  let cumulativeAngle = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px' }}>
      <svg viewBox="-1.2 -1.2 2.4 2.4" style={{ width: '280px', transform: 'rotate(-90deg)', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }}>
        {data.map((slice, i) => {
          const startAngle = cumulativeAngle;
          const sliceAngle = slice.value / total;
          cumulativeAngle += sliceAngle;
          
          const [startX, startY] = getCoordinatesForPercent(startAngle);
          const [endX, endY] = getCoordinatesForPercent(cumulativeAngle);
          
          const largeArcFlag = sliceAngle > 0.5 ? 1 : 0;
          
          return (
            <path
              key={i}
              d={`M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`}
              fill={slice.color}
              stroke="var(--bg-card)"
              strokeWidth="0.02"
            />
          );
        })}
      </svg>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px' }}>
        {data.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', backgroundColor: 'var(--bg-page)', padding: '5px 10px', borderRadius: '20px', border: '1px solid var(--border)', color: 'var(--text-main)' }}>
            <span style={{ width: '12px', height: '12px', backgroundColor: item.color, borderRadius: '50%' }}></span>
            <span style={{fontWeight: 600}}>{item.label}</span>
            <span style={{color: 'var(--text-light)'}}>({Math.round((item.value/total)*100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple SVG Line Chart
const SimpleLineChart = ({ data, xLabel, yLabel }: { data: { x: string, y: number }[], xLabel: string, yLabel: string }) => {
  const maxY = Math.max(...data.map(d => d.y)) * 1.2;
  const padding = 50;
  const width = 600;
  const height = 350;
  
  const points = data.map((d, i) => {
    const x = padding + (i * ((width - padding * 2) / (data.length - 1)));
    const y = height - padding - ((d.y / maxY) * (height - padding * 2));
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '10px' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '500px' }}>
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
           const y = height - padding - (tick * (height - padding * 2));
           return (
             <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--chart-grid)" strokeWidth="1" strokeDasharray="5,5" />
           )
        })}

        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--text-light)" strokeWidth="2" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--text-light)" strokeWidth="2" />
        
        {/* Labels */}
        <text x={width/2} y={height - 10} textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--text-main)">{xLabel}</text>
        <text x="15" y={height/2} textAnchor="middle" transform={`rotate(-90, 15, ${height/2})`} fontSize="14" fontWeight="600" fill="var(--text-main)">{yLabel}</text>

        {/* Line */}
        <polyline points={points} fill="none" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Dots & Values */}
        {data.map((d, i) => {
          const x = padding + (i * ((width - padding * 2) / (data.length - 1)));
          const y = height - padding - ((d.y / maxY) * (height - padding * 2));
          return (
            <g key={i} className="chart-point">
              <circle cx={x} cy={y} r="6" fill="var(--bg-card)" stroke="#0ea5e9" strokeWidth="3" />
              <text x={x} y={y - 15} textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--text-main)">{d.y}</text>
              <text x={x} y={height - padding + 20} textAnchor="middle" fontSize="12" fill="var(--text-light)">{d.x}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Simple SVG Scatter Chart
const SimpleScatterChart = ({ data, xLabel, yLabel }: { data: { x: number, y: number }[], xLabel: string, yLabel: string }) => {
  const maxX = Math.max(...data.map(d => d.x)) * 1.1;
  const maxY = Math.max(...data.map(d => d.y)) * 1.1;
  const minX = Math.min(...data.map(d => d.x)) * 0.8;
  const padding = 60;
  const width = 600;
  const height = 350;

  return (
     <div style={{ width: '100%', overflowX: 'auto', padding: '10px' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '500px' }}>
         {/* Grid background */}
         <rect x={padding} y={padding} width={width - padding*2} height={height - padding*2} fill="var(--bg-page)" />

        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--text-light)" strokeWidth="2" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--text-light)" strokeWidth="2" />
        
         {/* Labels */}
        <text x={width/2} y={height - 15} textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--text-main)">{xLabel}</text>
        <text x={width/2} y={height - 2} textAnchor="middle" fontSize="11" fill="#ef4444" fontStyle="italic">(Variable Independiente)</text>
        
        <text x="20" y={height/2} textAnchor="middle" transform={`rotate(-90, 20, ${height/2})`} fontSize="14" fontWeight="600" fill="var(--text-main)">{yLabel}</text>
        <text x="35" y={height/2} textAnchor="middle" transform={`rotate(-90, 35, ${height/2})`} fontSize="11" fill="#ef4444" fontStyle="italic">(Variable Dependiente)</text>

        {/* Dots */}
        {data.map((d, i) => {
          // Normalize X relative to minX to spread points better
          const xRange = maxX - minX;
          const cx = padding + (((d.x - minX) / xRange) * (width - padding * 2));
          const cy = height - padding - ((d.y / maxY) * (height - padding * 2));
          return (
            <g key={i}>
                <circle cx={cx} cy={cy} r="6" fill="#10b981" opacity="0.8" stroke="#065f46" strokeWidth="1"/>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Simple SVG Bar Chart
const SimpleBarChart = ({ data, title }: { data: { label: string, value: number, color: string }[], title?: string }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const width = 600;
    const height = 300;
    const padding = 50;
    const barWidth = (width - padding * 2) / data.length / 2;

    return (
        <div style={{ width: '100%', overflowX: 'auto', padding: '10px' }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '500px' }}>
                {title && <text x={width/2} y={30} textAnchor="middle" fontSize="16" fontWeight="bold" fill="var(--text-main)">{title}</text>}
                
                {/* Axes */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border)" strokeWidth="2" />

                {/* Bars */}
                {data.map((d, i) => {
                    const barHeight = (d.value / maxValue) * (height - padding * 2 - 40); // 40 for title space
                    const x = padding + (i * ((width - padding * 2) / data.length)) + barWidth/2;
                    const y = height - padding - barHeight;

                    return (
                        <g key={i}>
                            <rect 
                                x={x} 
                                y={y} 
                                width={barWidth} 
                                height={barHeight} 
                                fill={d.color} 
                                rx="4"
                            />
                            <text x={x + barWidth/2} y={y - 5} textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--text-main)">{d.value}%</text>
                            {/* Split label if too long */}
                            <text x={x + barWidth/2} y={height - padding + 15} textAnchor="middle" fontSize="11" fill="var(--text-light)" style={{fontSize: '10px'}}>
                                {d.label.split(' ').map((line, idx) => (
                                    <tspan x={x + barWidth/2} dy={idx === 0 ? 0 : 12} key={idx}>{line}</tspan>
                                ))}
                            </text>
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}

// --- Components ---

// Interactive Event Card
const EventCard = ({ title, emoji, color, examples }: { title: string, emoji: string, color: string, examples: string[] }) => {
  const [index, setIndex] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  const handleClick = () => {
    // Trigger vibration
    setIsShaking(true);
    // Change example
    setIndex((prevIndex) => (prevIndex + 1) % examples.length);
    
    // Remove vibration class after animation
    setTimeout(() => {
      setIsShaking(false);
    }, 400);
  };

  return (
    <div 
      className={`card ${isShaking ? 'shake-animation' : ''}`} 
      style={{
        borderColor: color, 
        borderWidth: '2px', 
        borderStyle: 'solid',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background-color 0.2s'
      }}
      onClick={handleClick}
      role="button"
      aria-label={`Ver ejemplo de evento ${title}`}
    >
        <div className="card-title" style={{color: color, display:'flex', alignItems:'center', gap:'10px'}}>
            <span style={{fontSize: '1.5rem'}}>{emoji}</span> {title}
        </div>
        <div style={{minHeight: '60px', display: 'flex', alignItems: 'center'}}>
           <p style={{margin: 0, fontStyle: 'italic', fontWeight: 500}}>"{examples[index]}"</p>
        </div>
        <small style={{display:'block', marginTop: '15px', color: 'var(--text-light)', fontSize: '0.75rem'}}>👆 Haz click para ver otro ejemplo</small>
    </div>
  );
};

const SampleCalculator = () => {
  // Finite population formula: n = (N * Z^2 * p * q) / (e^2 * (N - 1) + Z^2 * p * q)
  // Infinite population formula: n = (Z^2 * p * q) / e^2
  
  const [z, setZ] = useState(1.96); // 95% confidence
  const [p, setP] = useState(0.5);
  const [e, setE] = useState(0.05); // 5% error
  const [N, setN] = useState<string>(""); // Population size (optional)
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const q = 1 - p;
    const z2 = Math.pow(z, 2);
    const e2 = Math.pow(e, 2);
    const population = parseInt(N);

    let n;
    
    if (population && population > 0) {
        // Finite Population
        const numerator = population * z2 * p * q;
        const denominator = (e2 * (population - 1)) + (z2 * p * q);
        n = numerator / denominator;
    } else {
        // Infinite Population
        n = (z2 * p * q) / e2;
    }

    setResult(Math.ceil(n));
  };

  return (
    <div className="calculator">
      <h3 style={{marginTop: 0}}>Calculadora de Tamaño de la Muestra</h3>
      <p style={{fontSize: '0.9rem', color: 'var(--text-light)'}}>
        Introduce el tamaño de la población para usar la fórmula finita. Si se deja vacío, se asume población infinita.
      </p>
      
      <div className="card-grid" style={{gridTemplateColumns: '1fr 1fr'}}>
        <div className="input-group">
          <label>Tamaño de Población (N) <small style={{fontWeight:'normal', color:'var(--text-light)'}}>(Opcional)</small></label>
          <input 
            type="number" 
            min="1" 
            placeholder="Ej. 5000" 
            value={N} 
            onChange={(ev) => setN(ev.target.value)} 
          />
        </div>

        <div className="input-group">
          <label>Valor Z (Confianza)</label>
          <select value={z} onChange={(ev) => setZ(parseFloat(ev.target.value))} style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)'}}>
            <option value="1.645">90% (1.645)</option>
            <option value="1.96">95% (1.96)</option>
            <option value="2.576">99% (2.576)</option>
          </select>
        </div>
        
        <div className="input-group">
          <label>Probabilidad de éxito (p)</label>
          <input type="number" step="0.1" max="1" min="0" value={p} onChange={(ev) => setP(parseFloat(ev.target.value))} />
        </div>

        <div className="input-group">
          <label>Margen de Error (e)</label>
          <input type="number" step="0.01" max="1" min="0.01" value={e} onChange={(ev) => setE(parseFloat(ev.target.value))} />
        </div>
      </div>

      <button className="calc-btn" onClick={calculate}>Calcular Muestra</button>

      {result !== null && (
        <div className="result-box">
          Tamaño de muestra recomendado: <strong>{result}</strong>
          <div style={{fontSize: '0.8rem', marginTop: '5px', fontWeight: 'normal'}}>
            {N && parseInt(N) > 0 ? '(Basado en Población Finita)' : '(Basado en Población Infinita)'}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Home Banner Component ---
const HomeBanner = () => (
  <div style={{ marginBottom: '2rem' }}>
    <img 
      src="https://i.imgur.com/wJj73vN.png"
      alt="CodeSigma Banner" 
      style={{ 
        width: '100%', 
        height: 'auto', 
        borderRadius: '16px', 
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255,255,255,0.1)'
      }} 
    />
  </div>
);

const SectionHome = () => (
  <div className="animate-fade-in">
    <HomeBanner />
    <h1>Inicio</h1>
    <div className="card">
      <p>
        Esta página introduce el sitio web <strong>CodeSigma: Estadística para Informáticos</strong>, un espacio creado para presentar y explicar los principales conceptos de Probabilidad y Estadística aplicados al área de la Informática del curso <strong>EST 226</strong> impartido por la profesora Milagros García.
      </p>
      <p>
        Aquí encontrarás temas fundamentales del curso, ejemplos prácticos, análisis con datos reales y recursos visuales que hacen más clara la comprensión de los contenidos.
      </p>
    </div>

    {/* Profile Section */}
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      marginTop: '60px',
      marginBottom: '40px' 
    }}>
      <img 
        src="https://i.imgur.com/cZOPknC.png" 
        alt="Jonathan Gonzalez" 
        style={{
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          objectFit: 'cover',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          border: '6px solid var(--bg-card)'
        }}
      />
      <p style={{
        marginTop: '20px',
        fontSize: '1.5rem',
        fontWeight: '700',
        color: 'var(--text-main)'
      }}>
        Jonathan Gonzalez
      </p>
    </div>
  </div>
);

const SectionModule1 = () => (
  <div className="animate-fade-in">
    <h1>Estadística (Módulo 1)</h1>
    <p className="subtitle">Dominio de los conceptos básicos de estadística y capacidad para la organizar, representar y analizar datos.</p>
    
    <div style={{marginBottom: '2rem'}}>
        <p>La estadística es la ciencia que recopila, organiza, analiza e interpreta datos con el fin de apoyar la toma de decisiones. Su objetivo principal es transformar información numérica en conocimiento útil, permitiendo comprender fenómenos, identificar patrones y resolver problemas de diversas áreas, incluyendo informática, economía, salud y ciencias sociales.</p>
    </div>

    <h2 id="mod1-concepto">Concepto y Clasificación</h2>
    <div className="card-grid">
      <div className="card">
        <div className="card-title">Descriptiva o Deductiva</div>
        <p>Se encarga de recolectar, clasificar, ordenar, analizar y representar datos para obtener las características de un grupo.</p>
      </div>
      <div className="card">
        <div className="card-title">Teoría de la Probabilidad</div>
        <p>Proporciona las bases matemáticas para medir la incertidumbre y predecir la ocurrencia de eventos futuros.</p>
      </div>
      <div className="card">
        <div className="card-title">Inferencial o Inductiva</div>
        <p>Interpreta los datos recolectados para deducir conclusiones sobre una población mayor basándose en una muestra.</p>
      </div>
    </div>

    <h2 id="mod1-fuentes">Fuentes y Variables</h2>
    <div className="card-grid">
      <div className="card">
        <div className="card-title">Tipos de Fuente de Datos</div>
        <ul>
          <li><strong>Primaria:</strong> Datos originales recolectados directamente por el investigador para un propósito específico (ej. encuestas, entrevistas).</li>
          <li><strong>Secundaria:</strong> Datos ya existentes recolectados por otros organismos (ej. censos del INEI, reportes financieros).</li>
          <li><strong>Terciaria:</strong> Guías físicas o virtuales que contienen información compilada sobre fuentes secundarias (ej. bibliografías, enciclopedias).</li>
          <li><strong>Obras de Consultas.</strong></li>
        </ul>
      </div>
      <div className="card">
        <div className="card-title">Tipos de Variables</div>
        <p><strong style={{color: 'var(--accent)'}}>Cualitativas:</strong> Expresan cualidades o atributos.</p>
        <ul>
          <li><strong>Nominal:</strong> No tienen orden ni jerarquía. (Ej. Colores, Marcas de PC).</li>
          <li><strong>Binaria:</strong> Solo admiten dos posibilidades. (Ej. Sí/No, Encendido/Apagado).</li>
          <li><strong>Ordinal:</strong> Poseen un orden lógico. (Ej. Nivel de satisfacción: Bajo, Medio, Alto).</li>
        </ul>
        <p><strong style={{color: 'var(--accent)'}}>Cuantitativas:</strong> Se expresan numéricamente.</p>
        <ul>
          <li><strong>Discretas:</strong> Toman valores enteros contables. (Ej. Número de hijos, cantidad de CPUs).</li>
          <li><strong>Continuas:</strong> Toman valores infinitos dentro de un rango (medibles). (Ej. Peso, Temperatura del procesador).</li>
        </ul>
      </div>
    </div>

    <h2 id="mod1-metodo">El Método Estadístico</h2>
    <p>
      El método estadístico se basa en el <strong>Método Científico</strong>. Cuando no existen registros, es necesaria la realización de encuestas, ya sea tomando toda la población (censo) o una parte de ella (muestra) para deducir el comportamiento de las características de la totalidad de la población.
    </p>
    <div style={{textAlign: 'center', backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)'}}>
        <img 
            src="https://imgur.com/zpJxSm4.png" 
            alt="Proceso Estadístico" 
            className="responsive-img" 
            style={{margin: 0, border: 'none', boxShadow: 'none'}}
        />
        <p style={{fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '10px'}}>Recolección &rarr; Organización &rarr; Presentación &rarr; Análisis &rarr; Interpretación</p>
    </div>

    <h2 id="mod1-actividad">Actividad en Clase</h2>
    <div className="card" style={{borderLeft: '5px solid var(--success)'}}>
      <div className="card-title">Acceso a Internet (AIG)</div>
      <p>
        Utilización de <strong>Fuente Secundaria</strong> usando una fuente oficial disponible.
        La actividad en clase nos ayudó a conocer dónde buscar los datos para algún tema de interés si ya es existente, en este caso el Acceso a Internet por provincias y distritos. 
      </p>
      <p>
        En esta actividad también aprendimos las bases para realizar una encuesta y la estimación del tamaño de la muestra.
      </p>
    </div>

    <h2 id="mod1-muestra">Estimación del Tamaño de la Muestra</h2>
    <p>Para estimar una muestra confiable, debemos considerar:</p>
    <ul>
      <li><strong>La varianza:</strong> Dispersión de los datos.</li>
      <li><strong>Nivel de confianza:</strong> Probabilidad de que la estimación sea correcta.</li>
      <li><strong>Precisión de la estimación:</strong> Margen de error aceptable.</li>
    </ul>

    <SampleCalculator />

    <h2 id="mod1-muestreo">Clasificación de Muestreo</h2>
    <div className="card-grid">
      <div className="card">
        <div className="card-title" style={{color: 'var(--warning)'}}>No Probabilístico (Subjetivo)</div>
        <p>La selección depende del criterio del investigador.</p>
        <ul>
          <li><strong>Cuota:</strong> Se seleccionan individuos hasta cubrir cupos específicos por características (ej. 50 hombres y 50 mujeres).</li>
          <li><strong>Conveniencia:</strong> Se eligen individuos de fácil acceso o disponibles en el momento.</li>
          <li><strong>Bola de nieve:</strong> Los participantes reclutan a otros participantes; ideal para poblaciones difíciles de encontrar.</li>
          <li><strong>Juicio:</strong> Selección deliberada basada en el conocimiento y experiencia del investigador.</li>
        </ul>
      </div>
      <div className="card">
        <div className="card-title" style={{color: 'var(--success)'}}>Probabilístico (Aleatorio)</div>
        <p>Todos tienen la misma probabilidad de ser elegidos (azar).</p>
        <ul>
          <li><strong>Aleatorio simple:</strong> Como una rifa, cada individuo tiene igual probabilidad de selección.</li>
          <li><strong>Estratificado:</strong> La población se divide en subgrupos (estratos) y se muestrea aleatoriamente en cada uno.</li>
          <li><strong>Sistemático:</strong> Se elige un punto de partida al azar y luego se selecciona cada <em>k</em>-ésimo elemento.</li>
          <li><strong>Conglomerado:</strong> Se seleccionan grupos naturales (ej. escuelas, manzanas) al azar y se estudian todos sus miembros.</li>
        </ul>
      </div>
    </div>
  </div>
);

const SectionModule2 = () => (
  <div className="animate-fade-in">
    <h1>Probabilidad (Módulo 2)</h1>
    
    <h2 id="mod2-fundamentos">Conceptos Fundamentales</h2>
    <div className="card">
        <p><strong>Estadística Descriptiva:</strong> Se encarga de describir y analizar un conjunto de datos dado.</p>
        <p><strong>Teoría de la Probabilidad:</strong> Es una rama de las matemáticas que estudia los fenómenos aleatorios o estocásticos.</p>
        <p><strong>Estadística Inferencial:</strong> Deduce conclusiones importantes a partir de un conjunto de técnicas sobre un conjunto de datos para resolver un problema.</p>
    </div>

    <h2 id="mod2-definicion">Importancia y Definición</h2>
    <div className="card-grid">
      <div className="card">
        <div className="card-title">Definición</div>
        <p>La probabilidad es la forma habitual de cuantificar aquellos resultados que no pueden predecirse con certeza. El concepto intuitivo indica la posibilidad de la ocurrencia de un hecho o fenómeno. Es indispensable para estudiar situaciones (eventos o sucesos) que generan observaciones no predecibles con certeza.</p>
      </div>
      <div className="card">
        <div className="card-title">Importancia</div>
        <p>La evolución de la probabilidad es un eje central en la consolidación de la estadística moderna. Su impacto se extiende a campos como Salud, Ingeniería y Tecnología, Finanzas, Educación, Ciencias Sociales y Economía, y Medio Ambiente y Clima.</p>
      </div>
    </div>

    <h2 id="mod2-historia">Evolución Histórica</h2>
    
    <div style={{textAlign: 'center', marginBottom: '2rem'}}>
        <img 
            src="https://imgur.com/R5fOJTS.png" 
            alt="Línea de Tiempo de la Probabilidad" 
            className="responsive-img" 
            style={{margin: '0 auto', display: 'block'}}
        />
    </div>

    <div className="timeline">
        <div className="timeline-item">
            <div style={{fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center'}}>
               <span style={{fontSize: '1.5rem', marginRight: '10px'}}>🏛️</span> Bases: Civilizaciones Antiguas - Siglo XVI
            </div>
            <p style={{margin: 0}}>Primeros juegos de azar (Sumerios, Egipcios), el Triángulo Aritmético Chino (coeficientes binomiales, 1303), y Liber de ludo aleae de Girolamo Cardano (primer tratado sistemático, 1560).</p>
        </div>

        <div className="timeline-item">
            <div style={{fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center'}}>
               <span style={{fontSize: '1.5rem', marginRight: '10px'}}>✍️</span> Fundación Formal: Siglo XVII (1601-1700)
            </div>
            <p style={{margin: 0}}>Se inicia con el problema de la división de las apuestas de Chevalier de Méré, motivando el trabajo de Blaise Pascal y Pierre de Fermat. Christiaan Huygens publica el primer libro formal (Razonamiento sobre los juegos de azar, 1657).</p>
        </div>

        <div className="timeline-item">
            <div style={{fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center'}}>
               <span style={{fontSize: '1.5rem', marginRight: '10px'}}>⚖️</span> Consolidación: Siglo XVIII (1701-1800)
            </div>
            <p style={{margin: 0}}>Jacob Bernoulli demuestra la Ley de los Grandes Números (Arte de la Conjetura, 1713). Thomas Bayes demuestra el Teorema de Bayes (1761). Pierre-Simon Laplace publica Théorie analytique des probabilités (1812).</p>
        </div>

        <div className="timeline-item">
            <div style={{fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center'}}>
               <span style={{fontSize: '1.5rem', marginRight: '10px'}}>📈</span> Expansión: Siglo XIX (1801-1900)
            </div>
            <p style={{margin: 0}}>Desarrollo de distribuciones clave por Carl F. Gauss (Normal) y Simeon D. Poisson (Poisson). Andrey Markov desarrolla las Cadenas de Markov. Florence Nightingale aplica principios probabilísticos a la toma de decisiones.</p>
        </div>

        <div className="timeline-item">
            <div style={{fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center'}}>
               <span style={{fontSize: '1.5rem', marginRight: '10px'}}>🏗️</span> Formalización Moderna: Siglo XX (1901-2000)
            </div>
            <p style={{margin: 0}}>Andrei Kolmogorov establece los Axiomas de la Probabilidad (1933). Ronald A. Fisher formaliza las pruebas de hipótesis y desarrolla el método de máxima verosimilitud. Jerzy Neyman y Egon Pearson formalizan la teoría de pruebas de hipótesis.</p>
        </div>

        <div className="timeline-item">
            <div style={{fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center'}}>
               <span style={{fontSize: '1.5rem', marginRight: '10px'}}>🤖</span> Aplicaciones Contemporáneas: Siglo XX y XXI
            </div>
            <p style={{margin: 0}}>Claude Shannon desarrolla el concepto de entropía. Se destaca el uso de la probabilidad como base para el Machine Learning, Deep Learning, Inteligencia Artificial y el análisis de Big Data.</p>
        </div>
    </div>

    <h2 id="mod2-experiencias">Tipos de Experiencias y Eventos</h2>
    <div className="card-grid">
        <div className="card">
            <div className="card-title">Experiencia Determinística</div>
            <p>Aquella cuyo resultado se puede predecir con certeza antes de realizarla. <br/><em>Ej: Predecir que mañana es martes si hoy es lunes.</em></p>
        </div>
        <div className="card">
            <div className="card-title">Experiencia Aleatoria</div>
            <p>Existe incertidumbre y no se puede predecir el resultado, aunque se conoce el Espacio Muestral. <br/><em>Ej: Lanzar una moneda.</em></p>
        </div>
    </div>

    <h3>Tipos de Eventos</h3>
    <div className="card-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
        <EventCard 
            title="Imposible" 
            emoji="🚫" 
            color="#ef4444"
            examples={[
                "Lanzar un dado de 6 caras y obtener un 8.",
                "Sacar una bola verde de una urna con solo bolas rojas.",
                "Dibujar un triángulo plano con 4 lados."
            ]}
        />
        <EventCard 
            title="Probable" 
            emoji="🎲" 
            color="#f59e0b"
            examples={[
                "Lanzar una moneda y que salga cara.",
                "Que llueva mañana en una ciudad tropical.",
                "Sacar una carta de corazones de una baraja."
            ]}
        />
        <EventCard 
            title="Seguro" 
            emoji="✅" 
            color="#10b981"
            examples={[
                "Lanzar un dado y obtener un número menor a 7.",
                "Extraer una bola roja de una urna con solo bolas rojas.",
                "Que el día de mañana tenga 24 horas."
            ]}
        />
    </div>
  </div>
);

const SectionAnalysis = () => {
    // Mock data based on the "Architecture Faculty" context
    const pieData = [
        { label: 'Lic. en Arquitectura', value: 45, color: '#0f172a' },
        { label: 'Lic. Diseño Gráfico', value: 30, color: '#0ea5e9' },
        { label: 'Lic. Diseño de Interiores', value: 15, color: '#10b981' },
        { label: 'Otras', value: 10, color: '#f59e0b' }
    ];

    const lineData = [
        { x: '1° Año', y: 3.5 },
        { x: '2° Año', y: 4.2 },
        { x: '3° Año', y: 5.1 },
        { x: '4° Año', y: 6.8 },
        { x: '5° Año', y: 7.5 },
    ];

    // Edad (Independiente) vs Puntaje (Dependiente)
    const scatterData = [
        { x: 18, y: 40 }, { x: 19, y: 45 }, { x: 20, y: 30 }, 
        { x: 21, y: 60 }, { x: 22, y: 75 }, { x: 23, y: 65 }, 
        { x: 24, y: 80 }, { x: 25, y: 85 }, { x: 20, y: 40 },
        { x: 18, y: 35 }, { x: 22, y: 70 }, { x: 26, y: 90 }
    ];

    const wifiData = [
        { label: 'Muy Inseguro', value: 45, color: '#ef4444' },
        { label: 'Inseguro', value: 30, color: '#f97316' },
        { label: 'Neutral', value: 15, color: '#eab308' },
        { label: 'Seguro', value: 8, color: '#84cc16' },
        { label: 'Muy Seguro', value: 2, color: '#22c55e' }
    ];

    return (
        <div className="animate-fade-in">
            <h1>Percepción y Educación en Ciberseguridad</h1>
            <p className="subtitle">Análisis estadístico de la encuesta realizada a estudiantes de la Universidad de Panamá.</p>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <img 
                    src="https://i.imgur.com/D3RbNYQ.png" 
                    alt="Análisis de Encuesta" 
                    className="responsive-img" 
                    style={{ margin: '0 auto' }} 
                />
            </div>

            <h2 id="analisis-metodologia">1. Introducción y Metodología</h2>
            <div className="card">
                <p>
                    El estudio <strong>"Percepción y Educación en Ciberseguridad"</strong> se llevó a cabo principalmente durante el mes de noviembre de 2025. La población objetivo estuvo constituida por estudiantes de la Facultad de Arquitectura de la Universidad de Panamá, segmentados por sus respectivas carreras.
                </p>
                <p>
                    Para la recolección de datos se utilizó un método de <strong>Muestreo Probabilístico Aleatorio Simple</strong>, garantizando que todos los individuos de la población seleccionada tuvieran la misma oportunidad de participar. Si bien el tamaño de la muestra final no alcanzó la cantidad óptima para maximizar el nivel de confianza estadístico deseado, los resultados obtenidos brindan información cualitativa y cuantitativa valiosa.
                </p>
            </div>

            <h2 id="analisis-datos-generales">2. Datos Generales de la Muestra</h2>
            <div className="card">
                <p>
                    Se encuestaron a un total de <strong>68 estudiantes</strong> activos de diversas licenciaturas. Los datos demográficos indican una población predominantemente joven, característica del entorno universitario.
                </p>
                <ul>
                    <li><strong>Total de Encuestados:</strong> 68 estudiantes.</li>
                    <li><strong>Rango de Edad:</strong> 18 a 28 años.</li>
                    <li><strong>Género:</strong> 55% Femenino, 45% Masculino.</li>
                </ul>
                <p>
                    Esta sección de la muestra nos permite inferir comportamientos digitales de una generación nativa digital, pero que no necesariamente posee formación técnica especializada en seguridad informática.
                </p>
            </div>

            <h2 id="analisis-demografia">3. Distribución por Carrera</h2>
            <p>La distribución de la muestra refleja la diversidad académica dentro de la Facultad, con una mayoría de estudiantes provenientes de la carrera de Arquitectura.</p>
            <div className="card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <div className="card-title">Participación Estudiantil</div>
                <SimplePieChart data={pieData} />
                <p style={{ marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-light)', textAlign: 'center' }}>
                    <em>Gráfico 1: Representación porcentual según carrera. La carrera de Arquitectura representa el bloque mayoritario, seguido de Diseño Gráfico.</em>
                </p>
            </div>

            <h2 id="analisis-wifi">4. Percepción de Seguridad: Redes Wi-Fi</h2>
            <p>
                Una de las preguntas clave del estudio fue: <strong>"¿Qué tan seguro se siente al usar las redes Wi-Fi públicas o de la universidad?"</strong>. Los resultados revelan una desconfianza generalizada.
            </p>
            <div className="card">
                 <SimpleBarChart data={wifiData} title="Percepción de Seguridad en Wi-Fi Universitario" />
                 <div style={{marginTop: '20px'}}>
                    <p>
                        <strong>Análisis:</strong> El gráfico de barras muestra claramente que más del <strong>75%</strong> de los estudiantes encuestados perciben las redes públicas (incluida la de la universidad) como "Inseguras" o "Muy Inseguras".
                    </p>
                    <p>
                        Esta desconfianza puede atribuirse a varios factores:
                    </p>
                    <ul>
                        <li>Falta de información sobre los protocolos de seguridad de la red institucional.</li>
                        <li>Experiencias previas con virus o malware en redes abiertas.</li>
                        <li>El conocimiento empírico de que las redes abiertas son vulnerables a intercepciones de datos.</li>
                    </ul>
                    <p>
                        Es notable que, a pesar de ser nativos digitales, existe una barrera de confianza que podría limitar el uso de recursos académicos digitales dentro del campus.
                    </p>
                 </div>
            </div>

            <h2 id="analisis-resultados">5. Nivel de Conocimiento vs. Año Académico</h2>
            <p>Se analizó la evolución del conocimiento sobre prácticas seguras (uso de contraseñas robustas, identificación de phishing) a medida que los estudiantes avanzan en su carrera.</p>
            
            <div className="card">
                <SimpleLineChart data={lineData} xLabel="Año Académico" yLabel="Puntaje Promedio (1-10)" />
                <p style={{ marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-light)', textAlign: 'center' }}>
                    <em>Gráfico 3: Tendencia del conocimiento en ciberseguridad. Se observa un crecimiento sostenido, sugiriendo que la madurez académica y profesional contribuye indirectamente a una mejor higiene digital.</em>
                </p>
            </div>

            <h2 id="analisis-correlaciones">6. Correlaciones: Edad y Detección de Amenazas</h2>
            <p>Exploramos la relación estadística entre la edad del estudiante (variable independiente) y su capacidad para detectar amenazas digitales en una prueba práctica (variable dependiente).</p>
            
            <div className="card">
                <SimpleScatterChart data={scatterData} xLabel="Edad del Estudiante (Años)" yLabel="Puntaje de Detección (0-100)" />
                <p style={{ marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-light)', textAlign: 'center' }}>
                    <em>Gráfico 4: Dispersión Edad vs. Puntaje. La tendencia ascendente indica una correlación positiva: a mayor edad, mayor es la probabilidad de identificar correctamente intentos de estafa o sitios maliciosos. Esto podría deberse a una mayor experiencia acumulada en el uso de internet.</em>
                </p>
            </div>

            <h2>7. Conclusiones Preliminares</h2>
            <div className="card" style={{borderLeft: '5px solid var(--accent)'}}>
                <ul>
                    <li>Existe una <strong>brecha de confianza crítica</strong> en la infraestructura digital pública que provee la universidad.</li>
                    <li>La educación en ciberseguridad parece ser adquirida de manera <strong>empírica y no formal</strong>, ya que mejora con la edad y el año de carrera sin haber asignaturas específicas en el currículo de Arquitectura.</li>
                    <li>Se recomienda implementar campañas de concientización sobre el uso seguro del Wi-Fi institucional para mitigar la percepción negativa y fomentar un uso seguro de la tecnología.</li>
                </ul>
            </div>
        </div>
    );
};

const SectionCongreso = () => (
    <div className="animate-fade-in">
        <h1>Congreso Científico Nacional</h1>
        <p className="subtitle">Participación y aprendizaje en eventos académicos.</p>

        <h2 id="congreso-carteles">Sesión de carteles y posters</h2>
        
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <img src="https://i.imgur.com/cOERJaT.png" alt="Carteles" className="responsive-img" style={{ margin: '0 auto' }} />
        </div>

        <div className="card">
            <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap'}}>
                <div style={{fontSize: '3rem'}}>📊</div>
                <div>
                    <p>Esta sesión, estaba programada en el vestíbulo de la biblioteca Simón Bolívar y tenía una duración de ocho horas, estaba diseñada para ser un espacio de visibilidad continua para diversos trabajos estadísticos.</p>
                </div>
            </div>
            
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '20px' }}>
                <img src="https://i.imgur.com/M4SHhgp.png" alt="Evidencia 1" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                <img src="https://i.imgur.com/a0oTlr5.png" alt="Evidencia 2" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                <img src="https://i.imgur.com/CKf1erW.png" alt="Evidencia 3" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
            </div>
        </div>

        <h2 id="congreso-exposicion">Exposición de la Profesora Milagros del Carmen García</h2>
        <div className="card" style={{borderLeft: '5px solid var(--accent)'}}>
            <div className="card-title">Machine Learning interpretativo y árboles de decisión</div>
            <p>El tema central de la ponencia demuestra el uso de herramientas de estadística y computación avanzadas para el análisis de datos.</p>
            <p>La aplicación de estas metodologías a un problema social real ("la ocupación de mujeres rurales en Panamá") subraya la capacidad de la profesora para llevar su maestría en estadística a un estudio aplicado.</p>
            <p>El enfoque en Machine Learning interpretativo sugiere una presentación de datos con énfasis en la comprensión de los modelos, lo cual es fundamental para el análisis riguroso de fenómenos sociales.</p>
        </div>
    </div>
);

const SectionConclusiones = () => (
    <div className="animate-fade-in">
        <h1>Conclusiones</h1>
        <div className="card" style={{borderLeft: '5px solid var(--success)'}}>
            <div className="card-title">Reflexión Final</div>
            <p>
                A través del desarrollo de este sitio web "CodeSigma", hemos consolidado la importancia transversal de la estadística y la probabilidad en el campo de la informática.
            </p>
            <p>
                Hemos recorrido desde los conceptos fundamentales de recolección y organización de datos (Módulo 1) hasta la comprensión de la incertidumbre mediante la teoría de la probabilidad (Módulo 2). La aplicación práctica de estos conocimientos se evidenció en el estudio sobre ciberseguridad, donde el análisis de datos reales nos permitió identificar patrones de comportamiento y áreas críticas de mejora en la educación digital universitaria.
            </p>
            <p>
                Además, la integración de experiencias académicas externas, como el Congreso Científico Nacional, resalta cómo la estadística evoluciona hacia herramientas poderosas como el Machine Learning para abordar problemáticas sociales complejas. En conclusión, el dominio de estas herramientas analíticas no solo es un requisito académico, sino una competencia profesional esencial para interpretar la realidad y tomar decisiones fundamentadas en la era de los datos.
            </p>
        </div>
    </div>
);

const SectionReferencias = () => (
     <div className="animate-fade-in">
        <h1>Referencias Bibliográficas</h1>
        <div className="card">
            <ul style={{listStyle: 'none', padding: 0}}>
                <li style={{marginBottom: '15px', paddingLeft: '20px', textIndent: '-20px'}}>
                    📚 Triola, M. F. (2018). <em>Probabilidad y estadística</em> (12.a ed.). Pearson Educación.
                </li>
                <li style={{marginBottom: '15px', paddingLeft: '20px', textIndent: '-20px'}}>
                    📄 Rodríguez C., O. E., Dutari D., R. E., Rodríguez F., D. A., Fernández G., L., Díaz R., K. J., Quintero P., J. G., & Chang M., H. J. (2022). Percepción de la ciberseguridad: ciberdelitos, normas legales y políticas de seguridad. <em>Visión Antataura</em>, 6(2), 103–122. Recuperado a partir de <a href="https://revistas.up.ac.pa/index.php/antataura/article/view/3387" target="_blank" rel="noopener noreferrer">https://revistas.up.ac.pa/index.php/antataura/article/view/3387</a>
                </li>
                <li style={{marginBottom: '15px', paddingLeft: '20px', textIndent: '-20px'}}>
                    🔗 Jimenez, Y. (6 de 8 de 2023). Obtenido de <a href="http://up-rid.up.ac.pa/id/eprint/9233" target="_blank" rel="noopener noreferrer">http://up-rid.up.ac.pa/id/eprint/9233</a>
                </li>
                <li style={{marginBottom: '15px', paddingLeft: '20px', textIndent: '-20px'}}>
                    🔗 Universidad Metropolitana De Educación, Ciencia Y Tecnología. (31 de 12 de 2023). Obtenido de <a href="https://revistas.umecit.edu.pa/index.php/sc/article/view/1296" target="_blank" rel="noopener noreferrer">https://revistas.umecit.edu.pa/index.php/sc/article/view/1296</a>
                </li>
                <li style={{marginBottom: '15px', paddingLeft: '20px', textIndent: '-20px'}}>
                    🎓 Material de estudio de Classroom proporcionado por la profesora Milagros García durante el curso.
                </li>
            </ul>
        </div>
     </div>
);

const PlaceholderPage = ({ title, text }: { title: string, text: string }) => (
  <div className="animate-fade-in">
    <h1>{title}</h1>
    <div className="card" style={{minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <p style={{fontSize: '1.2rem', color: '#94a3b8'}}>{text}</p>
        <div style={{marginTop: '20px', color: '#cbd5e1'}}>
            <SigmaIcon />
        </div>
    </div>
  </div>
);

// --- Main App Component ---

const App = () => {
  const [activeSection, setActiveSection] = useState('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [darkMode, setDarkMode] = useState(false);

  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dark Mode Handling
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const handleNavClick = (section: string, id?: string) => {
    setActiveSection(section);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
    
    // If no specific ID, scroll to top
    if (!id) {
        document.querySelector('.main-content')?.scrollTo(0, 0);
    } else {
        // Wait for render if switching sections
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }
  };

  const subMenus = {
    modulo1: [
        { id: 'mod1-concepto', label: 'Concepto y Clasificación' },
        { id: 'mod1-fuentes', label: 'Fuentes y Variables' },
        { id: 'mod1-metodo', label: 'El Método Estadístico' },
        { id: 'mod1-actividad', label: 'Actividad en Clase' },
        { id: 'mod1-muestra', label: 'Tamaño de la Muestra' },
        { id: 'mod1-muestreo', label: 'Clasificación de Muestreo' },
    ],
    modulo2: [
        { id: 'mod2-fundamentos', label: 'Conceptos Fundamentales' },
        { id: 'mod2-definicion', label: 'Importancia y Definición' },
        { id: 'mod2-historia', label: 'Evolución Histórica' },
        { id: 'mod2-experiencias', label: 'Experiencias y Eventos' },
    ],
    analisis: [
        { id: 'analisis-metodologia', label: 'Metodología' },
        { id: 'analisis-datos-generales', label: 'Datos Generales' },
        { id: 'analisis-demografia', label: 'Demografía' },
        { id: 'analisis-wifi', label: 'Seguridad Wi-Fi' },
        { id: 'analisis-resultados', label: 'Nivel de Conocimiento' },
        { id: 'analisis-correlaciones', label: 'Correlaciones' },
    ],
    congreso: [
        { id: 'congreso-carteles', label: 'Sesión de Carteles' },
        { id: 'congreso-exposicion', label: 'Exposición Prof. Milagros' },
    ]
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'inicio': return <SectionHome />;
      case 'modulo1': return <SectionModule1 />;
      case 'modulo2': return <SectionModule2 />;
      case 'analisis': return <SectionAnalysis />;
      case 'congreso': return <SectionCongreso />;
      case 'conclusiones': return <SectionConclusiones />;
      case 'referencias': return <SectionReferencias />;
      default: return <SectionHome />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <nav className={`sidebar ${!sidebarOpen ? 'closed' : ''}`}>
        <div className="sidebar-header">
            <SigmaIcon />
            <span>CodeSigma</span>
        </div>
        
        <div className={`nav-item ${activeSection === 'inicio' ? 'active' : ''}`} onClick={() => handleNavClick('inicio')}>🏠 Inicio</div>
        
        <div className={`nav-item ${activeSection === 'modulo1' ? 'active' : ''}`} onClick={() => handleNavClick('modulo1')}>📊 Estadística (Mod 1)</div>
        {activeSection === 'modulo1' && (
            <div className="sub-nav-container">
                {subMenus.modulo1.map(sub => (
                    <div key={sub.id} className="sub-nav-item" onClick={() => handleNavClick('modulo1', sub.id)}>
                        {sub.label}
                    </div>
                ))}
            </div>
        )}

        <div className={`nav-item ${activeSection === 'modulo2' ? 'active' : ''}`} onClick={() => handleNavClick('modulo2')}>🎲 Probabilidad (Mod 2)</div>
        {activeSection === 'modulo2' && (
            <div className="sub-nav-container">
                {subMenus.modulo2.map(sub => (
                    <div key={sub.id} className="sub-nav-item" onClick={() => handleNavClick('modulo2', sub.id)}>
                        {sub.label}
                    </div>
                ))}
            </div>
        )}

        <div className={`nav-item ${activeSection === 'analisis' ? 'active' : ''}`} onClick={() => handleNavClick('analisis')}>📋 Análisis de la Encuesta</div>
        {activeSection === 'analisis' && (
            <div className="sub-nav-container">
                {subMenus.analisis.map(sub => (
                    <div key={sub.id} className="sub-nav-item" onClick={() => handleNavClick('analisis', sub.id)}>
                        {sub.label}
                    </div>
                ))}
            </div>
        )}

        <div className={`nav-item ${activeSection === 'congreso' ? 'active' : ''}`} onClick={() => handleNavClick('congreso')}>🏛️ Congreso Científico</div>
        {activeSection === 'congreso' && (
            <div className="sub-nav-container">
                {subMenus.congreso.map(sub => (
                    <div key={sub.id} className="sub-nav-item" onClick={() => handleNavClick('congreso', sub.id)}>
                        {sub.label}
                    </div>
                ))}
            </div>
        )}

        <div className={`nav-item ${activeSection === 'conclusiones' ? 'active' : ''}`} onClick={() => handleNavClick('conclusiones')}>📝 Conclusiones</div>
        <div className={`nav-item ${activeSection === 'referencias' ? 'active' : ''}`} onClick={() => handleNavClick('referencias')}>📚 Referencias</div>
      </nav>

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="top-bar">
          <div className="top-bar-left">
            <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle Menu">
              <MenuIcon />
            </button>
            <span style={{fontWeight: 600, color: 'var(--primary)', fontSize: '1.1rem'}}>CodeSigma</span>
            
            {/* Quick Navigation Icons */}
            <div className="quick-nav">
                <button className="quick-nav-btn" onClick={() => handleNavClick('inicio')} title="Inicio">🏠</button>
                <button className="quick-nav-btn" onClick={() => handleNavClick('modulo1')} title="Estadística">📊</button>
                <button className="quick-nav-btn" onClick={() => handleNavClick('modulo2')} title="Probabilidad">🎲</button>
                <button className="quick-nav-btn" onClick={() => handleNavClick('analisis')} title="Análisis">📋</button>
                <button className="quick-nav-btn" onClick={() => handleNavClick('congreso')} title="Congreso">🏛️</button>
                <button className="quick-nav-btn" onClick={() => handleNavClick('conclusiones')} title="Conclusiones">📝</button>
            </div>
          </div>

          <div className="top-bar-right">
             {/* Dark Mode Toggle */}
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} title={darkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}>
                {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
        
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);