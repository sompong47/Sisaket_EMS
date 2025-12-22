'use client';

import { useState, useEffect } from 'react';

interface Alert {
  id: number;
  title: string;
  level: 'info' | 'warning' | 'critical';
  type: string;
  timestamp: string;
  message: string;
}

export default function EmergencyPage() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      title: 'เตือนระดับน้ำเพิ่มขึ้น',
      level: 'warning',
      type: 'flood',
      timestamp: new Date().toISOString(),
      message: 'พบระดับน้ำในแม่น้ำเจ้าพระยาเพิ่มขึ้น 20 ซม. ในช่วง 6 ชั่วโมงที่ผ่านมา'
    },
    {
      id: 2,
      title: 'อัปเดตสถานการณ์ทั่วไป',
      level: 'info',
      type: 'general',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      message: 'ศูนย์พักพิงทั้งหมด 944 แห่งพร้อมให้บริการ มีผู้อพยพรวม 12,450 คน'
    }
  ]);
  const [currentLevel, setCurrentLevel] = useState('normal');
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (currentLevel === 'critical') {
      setIsBlinking(true);
    } else {
      setIsBlinking(false);
    }
  }, [currentLevel]);

  const handleBroadcast = () => {
    const msg = prompt('ระบุข้อความแจ้งเตือนฉุกเฉิน (SMS/Line):');
    if (msg) {
      alert(`📡 ส่งข้อความ: "${msg}" \nไปยังหัวหน้าศูนย์ 944 ท่านเรียบร้อยแล้ว!`);
      const newAlert = {
        id: Date.now(),
        title: 'ประกาศฉุกเฉินจากส่วนกลาง',
        level: 'critical' as const,
        type: 'broadcast',
        timestamp: new Date().toISOString(),
        message: msg
      };
      setAlerts([newAlert, ...alerts]);
    }
  };

  const levelConfig = {
    normal: {
      emoji: '🟢',
      label: 'ปกติ',
      labelEn: 'NORMAL',
      color: '#10b981',
      bg: 'linear-gradient(135deg, #065f46, #10b981)',
      glow: 'rgba(16, 185, 129, 0.3)'
    },
    watch: {
      emoji: '🟡',
      label: 'เฝ้าระวัง',
      labelEn: 'WATCH',
      color: '#f59e0b',
      bg: 'linear-gradient(135deg, #b45309, #f59e0b)',
      glow: 'rgba(245, 158, 11, 0.3)'
    },
    warning: {
      emoji: '🟠',
      label: 'เตือนภัย',
      labelEn: 'WARNING',
      color: '#f97316',
      bg: 'linear-gradient(135deg, #c2410c, #f97316)',
      glow: 'rgba(249, 115, 22, 0.3)'
    },
    critical: {
      emoji: '🔴',
      label: 'วิกฤต',
      labelEn: 'CRITICAL',
      color: '#ef4444',
      bg: 'linear-gradient(135deg, #b91c1c, #ef4444)',
      glow: 'rgba(239, 68, 68, 0.5)'
    }
  };

  const currentConfig = levelConfig[currentLevel as keyof typeof levelConfig];

  const getAlertIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      flood: '🌊',
      storm: '⛈️',
      general: '📝',
      broadcast: '📢',
      earthquake: '🌋'
    };
    return icons[type] || '📝';
  };

  const getLevelBadge = (level: string) => {
    const config = {
      critical: { bg: '#fee2e2', color: '#b91c1c', label: 'วิกฤต' },
      warning: { bg: '#fef3c7', color: '#b45309', label: 'เตือน' },
      info: { bg: '#dbeafe', color: '#1e40af', label: 'ทั่วไป' }
    };
    const c = config[level as keyof typeof config] || config.info;
    return (
      <span style={{
        background: c.bg,
        color: c.color,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '600'
      }}>
        {c.label}
      </span>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '30px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '30px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
          }}>
            
          </div>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '2.5rem', 
              fontWeight: '900',
              color: 'white',
              letterSpacing: '-1px'
            }}>
              ระบบบัญชาการฉุกเฉิน
            </h1>
            <p style={{ 
              margin: '5px 0 0 0', 
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '1rem'
            }}>
              War Room - ศูนย์สั่งการและกระจายข่าวสารภัยพิบัติ
            </p>
          </div>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        
        {/* Current Status Card */}
        <div style={{ 
          background: currentConfig.bg,
          padding: '35px', 
          borderRadius: '24px',
          boxShadow: `0 20px 60px ${currentConfig.glow}`,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          animation: isBlinking ? 'blink 1s infinite' : 'none'
        }}>
          <style>
            {`
              @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
              }
              @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
              }
            `}
          </style>
          
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              fontSize: '0.85rem', 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: '600',
              marginBottom: '15px',
              letterSpacing: '2px'
            }}>
              CURRENT STATUS
            </div>
            
            <div style={{ 
              fontSize: '4rem',
              marginBottom: '10px',
              animation: currentLevel === 'critical' ? 'pulse 2s infinite' : 'none'
            }}>
              {currentConfig.emoji}
            </div>
            
            <div style={{
              fontSize: '2rem',
              fontWeight: '900',
              color: 'white',
              marginBottom: '5px',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }}>
              {currentConfig.label}
            </div>
            
            <div style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: '600',
              letterSpacing: '3px',
              marginBottom: '25px'
            }}>
              {currentConfig.labelEn}
            </div>

            {/* Level Buttons */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px'
            }}>
              {Object.entries(levelConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setCurrentLevel(key)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: currentLevel === key ? '2px solid white' : '1px solid rgba(255, 255, 255, 0.3)',
                    background: currentLevel === key ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.3s',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = currentLevel === key ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {config.emoji} {config.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Broadcast Card */}
        <div style={{ 
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          padding: '35px', 
          borderRadius: '24px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 20px 60px rgba(168, 85, 247, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '8rem',
            opacity: 0.1,
            transform: 'rotate(-15deg)'
          }}>
            📢
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              fontSize: '3rem',
              marginBottom: '15px'
            }}>
              📢
            </div>
            <h3 style={{ 
              margin: '0 0 10px 0', 
              fontSize: '1.8rem', 
              fontWeight: '800',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }}>
              กระจายข่าวฉุกเฉิน
            </h3>
            <p style={{ 
              fontSize: '0.95rem', 
              opacity: 0.9, 
              marginBottom: '25px',
              lineHeight: '1.5'
            }}>
              ส่ง SMS/Line แจ้งเตือนหัวหน้าศูนย์<br/>ทั้งหมด <strong>944 ท่าน</strong> ทันที
            </p>
            
            <button 
              onClick={handleBroadcast}
              style={{ 
                background: 'white', 
                color: '#7c3aed', 
                border: 'none', 
                padding: '16px 32px', 
                borderRadius: '12px', 
                fontSize: '1rem', 
                fontWeight: '700', 
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s',
                width: '100%'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
              }}
            >
              🚀 ส่งข้อความแจ้งเตือน
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          padding: '35px', 
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h3 style={{ 
            margin: 0,
            color: 'white',
            fontSize: '1.3rem',
            fontWeight: '700'
          }}>
            📊 สถิติแจ้งเตือนวันนี้
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[
              { label: 'แจ้งเตือนทั้งหมด', value: alerts.length, color: '#60a5fa' },
              { label: 'วิกฤต', value: alerts.filter(a => a.level === 'critical').length, color: '#ef4444' },
              { label: 'เตือนภัย', value: alerts.filter(a => a.level === 'warning').length, color: '#f59e0b' },
              { label: 'ทั่วไป', value: alerts.filter(a => a.level === 'info').length, color: '#10b981' }
            ].map((stat, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem' }}>
                  {stat.label}
                </span>
                <span style={{
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  color: stat.color
                }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Timeline */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        padding: '30px',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginBottom: '25px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem'
          }}>
            📜
          </div>
          <h3 style={{ 
            color: 'white', 
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '700'
          }}>
            ประวัติการแจ้งเตือนล่าสุด
          </h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {alerts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '1rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📭</div>
              ยังไม่มีการแจ้งเตือน
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} style={{ 
                display: 'flex', 
                gap: '20px', 
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                padding: '25px', 
                borderRadius: '16px', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderLeft: `4px solid ${
                  alert.level === 'critical' ? '#ef4444' : 
                  alert.level === 'warning' ? '#f59e0b' : '#3b82f6'
                }`,
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.transform = 'translateX(5px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}>
                <div style={{ 
                  fontSize: '2.5rem',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px'
                }}>
                  {getAlertIcon(alert.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '10px',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <h4 style={{ 
                      margin: 0, 
                      fontSize: '1.2rem', 
                      color: 'white',
                      fontWeight: '600'
                    }}>
                      {alert.title}
                    </h4>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {getLevelBadge(alert.level)}
                      <span style={{ 
                        fontSize: '0.85rem', 
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontWeight: '500'
                      }}>
                        {new Date(alert.timestamp).toLocaleString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })} น.
                      </span>
                    </div>
                  </div>
                  <p style={{ 
                    margin: 0, 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    fontSize: '1rem',
                    lineHeight: '1.6'
                  }}>
                    {alert.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}