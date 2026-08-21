import React, { useState, useEffect, useCallback } from 'react';

const CleanFloorPlan = () => (
  <g>
    {/* 원형 외곽선 - 복도가 원 라인 안에 자연스럽게 들어오도록 정리 */}
    <circle cx="450" cy="450" r="438" fill="#f8fafc" stroke="#111827" strokeWidth="4" />

    {/* 북측 상부 돌출 복도 */}
    <rect x="440" y="42" width="96" height="120" rx="14" fill="#050505" />

    {/* 북측 세로 복도 */}
    <rect x="365" y="108" width="106" height="247" rx="18" fill="#050505" />

    {/* 중앙 가로 복도 - 오른쪽 끝이 원 라인 안에 맞도록 길이 조정 */}
    <rect x="160" y="286" width="690" height="114" rx="18" fill="#050505" />

    {/* 남측 순환 복도 */}
    <path
      d="M270 366
         C252 430 250 520 247 615
         C244 700 239 760 282 801
         C312 829 357 823 389 790
         C427 751 446 709 492 688
         C533 670 586 688 619 661
         C660 628 659 586 635 540
         L562 398
         C506 369 410 356 333 357
         C303 358 282 361 270 366 Z"
      fill="#050505"
    />

    {/* 중앙 긴 타원형 비사용 공간 */}
    <ellipse cx="432" cy="493" rx="157" ry="43" transform="rotate(41 432 493)" fill="#f8fafc" />

    {/* 하단 작은 타원형 비사용 공간 */}
    <ellipse cx="349" cy="689" rx="39" ry="70" transform="rotate(19 349 689)" fill="#f8fafc" />
  </g>
);

// 13개 데이터 입력 구역 - 모든 핀이 검은색 복도 안쪽에만 오도록 재배치
const ZONES = [
  // α group · 북측 / 긴 타원형 상부
  { code: 'α1', group: 'α', x: 326, y: 348, color: '#ef4444', desc: '긴 타원형 위쪽 좌측 복도' },
  { code: 'α2', group: 'α', x: 462, y: 404, color: '#ef4444', desc: '긴 타원형 위쪽 중앙 복도' },
  { code: 'α3', group: 'α', x: 420, y: 245, color: '#ef4444', desc: '북측 세로 복도' },

  // β group · 연결 끊김 확인용 최소 지점
  { code: 'β1', group: 'β', x: 575, y: 343, color: '#f97316', desc: '동측 연결 끊김 확인 1', unstable: true },
  { code: 'β2', group: 'β', x: 715, y: 343, color: '#f97316', desc: '동측 연결 끊김 확인 2', unstable: true },

  // γ group · 긴 타원형 하부 / 남측 순환 복도
  { code: 'γ1', group: 'γ', x: 440, y: 597, color: '#22c55e', desc: '긴 타원형 아래쪽 복도' },
  { code: 'γ2', group: 'γ', x: 548, y: 646, color: '#22c55e', desc: '남동 하단 복도' },
  { code: 'γ3', group: 'γ', x: 417, y: 715, color: '#22c55e', desc: '남측 중앙 복도' },
  { code: 'γ4', group: 'γ', x: 308, y: 770, color: '#22c55e', desc: '남서 하단 복도' },
  { code: 'γ5', group: 'γ', x: 592, y: 535, color: '#22c55e', desc: '우측 곡선 통로' },

  // δ group · 서측 복도
  { code: 'δ1', group: 'δ', x: 274, y: 640, color: '#3b82f6', desc: '서측 하단 복도' },
  { code: 'δ2', group: 'δ', x: 294, y: 518, color: '#3b82f6', desc: '서측 중앙 복도' },
  { code: 'δ3', group: 'δ', x: 198, y: 344, color: '#3b82f6', desc: '서측 끝 복도' },
];

const TEAMS = [
  { id: 1, name: '1팀', color: '#fbbf24' },
  { id: 2, name: '2팀', color: '#fb923c' },
  { id: 3, name: '3팀', color: '#a855f7' },
  { id: 4, name: '4팀', color: '#3b82f6' },
  { id: 5, name: '5팀', color: '#22c55e' },
];

const STORAGE_KEY = 'mission1_data_v13';

const getRadiationColor = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const v = parseFloat(value);
  if (isNaN(v)) return null;
  if (v < 2) return '#22c55e';
  if (v < 4) return '#eab308';
  if (v < 6) return '#f97316';
  if (v < 8) return '#ef4444';
  return '#7f1d1d';
};

// ================== 지도 ==================
const FloorMap = ({ zoneData, onZoneClick, selectedZone, heatmapMode = false, teamId = null, landmarksMode = false }) => {
  const getPinFill = (zone) => {
    if (heatmapMode) {
      let values = [];
      if (teamId) {
        const v = zoneData[teamId]?.[zone.code]?.radiation;
        if (v !== undefined && v !== '') values.push(parseFloat(v));
      } else {
        TEAMS.forEach(t => {
          const v = zoneData[t.id]?.[zone.code]?.radiation;
          if (v !== undefined && v !== '') values.push(parseFloat(v));
        });
      }
      if (values.length === 0) return '#d1d5db';
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return getRadiationColor(avg) || '#d1d5db';
    }
    const filled = teamId && zoneData[teamId]?.[zone.code]?.radiation;
    return filled ? zone.color : 'white';
  };
  
  const zoneWithBridge = (code) => TEAMS.some(t => zoneData[t.id]?.[code]?.bridge);
  const zoneWithCapsule = (code) => TEAMS.some(t => zoneData[t.id]?.[code]?.capsule);
  
  return (
    <svg viewBox="0 0 900 900" style={{ width: '100%', maxWidth: '780px', height: 'auto', display: 'block' }}>
      <CleanFloorPlan />
      
      {ZONES.map(zone => {
        const isSelected = selectedZone === zone.code;
        const filled = teamId && zoneData[teamId]?.[zone.code]?.radiation;
        const pinFill = getPinFill(zone);
        const r = isSelected ? 18 : 16;
        const hasBridge = landmarksMode && zoneWithBridge(zone.code);
        const hasCapsule = landmarksMode && zoneWithCapsule(zone.code);
        
        return (
          <g key={zone.code}
             style={{ cursor: onZoneClick ? 'pointer' : 'default' }}
             onClick={() => onZoneClick && onZoneClick(zone.code)}>
            <ellipse cx={zone.x + 2} cy={zone.y + 4} rx={r + 2} ry={(r + 2) * 0.35} fill="rgba(0,0,0,0.35)" />
            <circle cx={zone.x} cy={zone.y} r={r + 4} fill={isSelected ? '#000' : 'white'} />
            <circle cx={zone.x} cy={zone.y} r={r} fill={pinFill} stroke={zone.color} strokeWidth="3" />
            <text x={zone.x} y={zone.y + 7} textAnchor="middle" fontSize="14" fontWeight="bold"
                  fill={filled || (heatmapMode && pinFill !== '#d1d5db') ? 'white' : zone.color}
                  style={{ pointerEvents: 'none' }}>
              {zone.code}
            </text>
            
            {filled && !heatmapMode && !landmarksMode && (
              <g style={{ pointerEvents: 'none' }}>
                <circle cx={zone.x + r * 0.7} cy={zone.y - r * 0.7} r="11" fill="#10b981" stroke="white" strokeWidth="2" />
                <text x={zone.x + r * 0.7} y={zone.y - r * 0.7 + 4} textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">✓</text>
              </g>
            )}
            
            {hasBridge && (
              <g style={{ pointerEvents: 'none' }}>
                <circle cx={zone.x - r * 0.7} cy={zone.y - r * 0.8} r="15" fill="#1f2937" stroke="white" strokeWidth="2.5" />
                <text x={zone.x - r * 0.7} y={zone.y - r * 0.8 + 5} textAnchor="middle" fontSize="14">🌉</text>
              </g>
            )}
            {hasCapsule && (
              <g style={{ pointerEvents: 'none' }}>
                <circle cx={zone.x + r * 0.7} cy={zone.y - r * 0.8} r="15" fill="#fbbf24" stroke="white" strokeWidth="2.5" />
                <text x={zone.x + r * 0.7} y={zone.y - r * 0.8 + 5} textAnchor="middle" fontSize="14">💊</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ================== 입력 폼 ==================
const InputForm = ({ zone, currentData, onSave, onClose }) => {
  const zoneInfo = ZONES.find(z => z.code === zone);
  const [radiation, setRadiation] = useState(currentData?.radiation || '');
  const [temp, setTemp] = useState(currentData?.temp || '');
  const [humidity, setHumidity] = useState(currentData?.humidity || '');
  const [bridge, setBridge] = useState(currentData?.bridge || false);
  const [capsule, setCapsule] = useState(currentData?.capsule || false);
  
  const handleSave = () => {
    onSave({ radiation, temp, humidity, bridge, capsule, timestamp: Date.now() });
    onClose();
  };
  
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: '16px'
    }}>
      <div style={{
        background: 'white', padding: '24px', borderRadius: '16px',
        maxWidth: '400px', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '50%',
            background: zoneInfo.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: 'bold', color: 'white', marginRight: '12px'
          }}>
            {zone}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px' }}>구역 {zone}</h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>{zoneInfo.desc}</p>
          </div>
        </div>
        
        {zoneInfo.unstable && (
          <div style={{
            background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px',
            padding: '8px 12px', marginBottom: '16px', fontSize: '13px', color: '#92400e'
          }}>
            ⚠ 통신 불안정 구역 — FPV 화면이 흔들릴 수 있음
          </div>
        )}
        
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#374151', fontWeight: '500' }}>
            방사선량 (mSv/h)
          </label>
          <input type="number" step="0.1" value={radiation}
            onChange={(e) => setRadiation(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }}
            placeholder="예: 3.5" />
        </div>
        
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#374151', fontWeight: '500' }}>
            온도 (°C)
          </label>
          <input type="number" value={temp}
            onChange={(e) => setTemp(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }}
            placeholder="예: 45" />
        </div>
        
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#374151', fontWeight: '500' }}>
            습도 (%)
          </label>
          <input type="number" value={humidity}
            onChange={(e) => setHumidity(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }}
            placeholder="예: 60" />
        </div>
        
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '14px', marginTop: '4px' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
            이 구역에서 발견한 것 (해당 시 체크)
          </p>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', padding: '10px 12px', background: bridge ? '#dbeafe' : '#f3f4f6', borderRadius: '8px', cursor: 'pointer', border: bridge ? '1px solid #3b82f6' : '1px solid transparent' }}>
            <input type="checkbox" checked={bridge} onChange={(e) => setBridge(e.target.checked)} style={{ marginRight: '12px', transform: 'scale(1.3)' }} />
            <span style={{ fontSize: '15px' }}>🌉 교량 발견</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', background: capsule ? '#fef3c7' : '#f3f4f6', borderRadius: '8px', cursor: 'pointer', border: capsule ? '1px solid #f59e0b' : '1px solid transparent' }}>
            <input type="checkbox" checked={capsule} onChange={(e) => setCapsule(e.target.checked)} style={{ marginRight: '12px', transform: 'scale(1.3)' }} />
            <span style={{ fontSize: '15px' }}>💊 캡슐 발견</span>
          </label>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '14px' }}>
            취소
          </button>
          <button onClick={handleSave} style={{ flex: 2, padding: '12px', border: 'none', borderRadius: '6px', background: '#3b82f6', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

// ================== 팀 뷰 ==================
const TeamView = ({ teamId, data, onSave, onBack }) => {
  const [selectedZone, setSelectedZone] = useState(null);
  const team = TEAMS.find(t => t.id === teamId);
  const teamData = data[teamId] || {};
  const completedCount = Object.keys(teamData).length;
  
  return (
    <div style={{ padding: '16px', maxWidth: '820px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
        <button onClick={onBack} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>
          ← 팀 선택
        </button>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: team.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
          {teamId}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>{team.name} · 정찰 기록</h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>진행: {completedCount} / {ZONES.length} 구역</p>
        </div>
      </div>
      
      <div style={{ background: '#e5e7eb', height: '8px', borderRadius: '4px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ width: `${(completedCount / ZONES.length) * 100}%`, height: '100%', background: team.color, transition: 'width 0.3s' }} />
      </div>
      
      <div style={{ background: 'white', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
          구역 핀을 탭하여 데이터 입력
        </p>
        <FloorMap zoneData={data} onZoneClick={setSelectedZone} teamId={teamId} />
      </div>
      
      {selectedZone && (
        <InputForm zone={selectedZone} currentData={teamData[selectedZone]}
          onSave={(inputData) => onSave(teamId, selectedZone, inputData)}
          onClose={() => setSelectedZone(null)} />
      )}
    </div>
  );
};

// ================== 강사 뷰 ==================
const AdminView = ({ data, onBack }) => {
  const [mode, setMode] = useState('heatmap');
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  return (
    <div style={{ padding: '16px', maxWidth: '820px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
        <button onClick={onBack} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>
          ← 팀 선택
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', flex: 1 }}>강사 · 결과 화면</h2>
      </div>
      
      <div style={{ background: 'white', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>팀별 진행 상태</h3>
        {TEAMS.map(team => {
          const teamData = data[team.id] || {};
          const done = Object.keys(teamData).length;
          const pct = (done / ZONES.length) * 100;
          return (
            <div key={team.id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: team.color, marginRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: 'white' }}>
                  {team.id}
                </div>
                <span style={{ flex: 1, fontSize: '13px' }}>{team.name}</span>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>{done}/{ZONES.length}</span>
              </div>
              <div style={{ background: '#e5e7eb', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: team.color, transition: 'width 0.3s' }} />
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button onClick={() => setMode('heatmap')}
          style={{
            flex: 1, padding: '10px', border: 'none', borderRadius: '6px',
            background: mode === 'heatmap' ? '#3b82f6' : '#e5e7eb',
            color: mode === 'heatmap' ? 'white' : '#374151',
            cursor: 'pointer', fontSize: '13px', fontWeight: '500'
          }}>
          🔥 방사선량 히트맵
        </button>
        <button onClick={() => setMode('landmarks')}
          style={{
            flex: 1, padding: '10px', border: 'none', borderRadius: '6px',
            background: mode === 'landmarks' ? '#3b82f6' : '#e5e7eb',
            color: mode === 'landmarks' ? 'white' : '#374151',
            cursor: 'pointer', fontSize: '13px', fontWeight: '500'
          }}>
          🌉 교량·💊 캡슐
        </button>
      </div>
      
      {mode === 'heatmap' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>보기:</span>
          <button onClick={() => setSelectedTeam(null)}
            style={{
              padding: '4px 10px', border: 'none', borderRadius: '4px',
              background: selectedTeam === null ? '#111' : '#e5e7eb',
              color: selectedTeam === null ? 'white' : '#374151',
              fontSize: '12px', cursor: 'pointer'
            }}>
            전체 평균
          </button>
          {TEAMS.map(t => (
            <button key={t.id} onClick={() => setSelectedTeam(t.id)}
              style={{
                padding: '4px 10px', border: 'none', borderRadius: '4px',
                background: selectedTeam === t.id ? t.color : '#e5e7eb',
                color: selectedTeam === t.id ? 'white' : '#374151',
                fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
              }}>
              {t.id}팀
            </button>
          ))}
        </div>
      )}
      
      <div style={{ background: 'white', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <FloorMap zoneData={data} heatmapMode={mode === 'heatmap'} teamId={selectedTeam} landmarksMode={mode === 'landmarks'} />
        
        {mode === 'heatmap' && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '11px', color: '#6b7280' }}>
            <span>낮음</span>
            <div style={{ width: '24px', height: '12px', background: '#22c55e' }} />
            <div style={{ width: '24px', height: '12px', background: '#eab308' }} />
            <div style={{ width: '24px', height: '12px', background: '#f97316' }} />
            <div style={{ width: '24px', height: '12px', background: '#ef4444' }} />
            <div style={{ width: '24px', height: '12px', background: '#7f1d1d' }} />
            <span>높음 (mSv/h)</span>
          </div>
        )}
        
        {mode === 'landmarks' && (
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#374151' }}>
            <p style={{ margin: '4px 0' }}>🌉 표시된 구역: 팀들이 교량 발견 체크한 위치</p>
            <p style={{ margin: '4px 0' }}>💊 표시된 구역: 팀들이 캡슐 발견 체크한 위치</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ================== 홈 ==================
const HomeView = ({ onSelectTeam, onSelectAdmin, onReset }) => (
  <div style={{ padding: '24px 16px', maxWidth: '500px', margin: '0 auto' }}>
    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
      <h1 style={{ margin: '0 0 4px 0', fontSize: '24px' }}>극한환경 탐사 미션</h1>
      <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>미션 1 · 정찰 매핑 (13개 구역)</p>
    </div>
    
    <div style={{ marginBottom: '24px' }}>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>팀을 선택하세요</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px' }}>
        {TEAMS.map(team => (
          <button key={team.id} onClick={() => onSelectTeam(team.id)}
            style={{
              padding: '20px 12px', border: 'none', borderRadius: '12px',
              background: team.color, cursor: 'pointer', fontSize: '18px',
              fontWeight: 'bold', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
            {team.id}
          </button>
        ))}
      </div>
    </div>
    
    <button onClick={onSelectAdmin}
      style={{
        width: '100%', padding: '14px', border: '2px solid #3b82f6', borderRadius: '10px',
        background: 'white', color: '#3b82f6', cursor: 'pointer', fontSize: '14px',
        fontWeight: '500', marginBottom: '10px'
      }}>
      👨‍🏫 강사 화면 (결과 보기)
    </button>
    
    <button onClick={onReset}
      style={{
        width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px',
        background: 'white', color: '#ef4444', cursor: 'pointer', fontSize: '12px'
      }}>
      전체 데이터 초기화
    </button>
  </div>
);

export default function Mission1App() {
  const [view, setView] = useState('home');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const load = async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, true);
        if (res && res.value) setData(JSON.parse(res.value));
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, true);
        if (res && res.value) setData(JSON.parse(res.value));
      } catch (e) {}
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const handleSave = useCallback(async (teamId, zoneCode, inputData) => {
    const newData = {
      ...data,
      [teamId]: { ...(data[teamId] || {}), [zoneCode]: inputData },
    };
    setData(newData);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(newData), true);
    } catch (e) {}
  }, [data]);
  
  const handleReset = async () => {
    if (!confirm('모든 팀 데이터를 초기화합니다. 계속하시겠습니까?')) return;
    setData({});
    try {
      await window.storage.delete(STORAGE_KEY, true);
    } catch (e) {}
  };
  
  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>로딩 중...</div>;
  }
  
  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {view === 'home' && (
        <HomeView
          onSelectTeam={(id) => { setSelectedTeam(id); setView('team'); }}
          onSelectAdmin={() => setView('admin')}
          onReset={handleReset} />
      )}
      {view === 'team' && (
        <TeamView teamId={selectedTeam} data={data} onSave={handleSave} onBack={() => setView('home')} />
      )}
      {view === 'admin' && (
        <AdminView data={data} onBack={() => setView('home')} />
      )}
    </div>
  );
}
