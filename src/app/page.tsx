'use client';

import { useState, useEffect, useMemo } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    centers: 144,
    items: 2847,
    critical: 12,
    alerts: 3
  });
  const [loading, setLoading] = useState(false);

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 100));
  }, []);

  const criticalItems = [
    { name: 'น้ำดื่ม', icon: '💧', amount: '150 ลัง', percent: 25, status: 'critical' },
    { name: 'อาหารแห้ง', icon: '🍱', amount: '250 กล่อง', percent: 45, status: 'warning' },
    { name: 'ผ้าห่ม', icon: '🛏️', amount: '680 ผืน', percent: 80, status: 'normal' },
    { name: 'ยาสามัญ', icon: '💊', amount: '420 ชุด', percent: 75, status: 'normal' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
          }}>
            📊
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '2rem',
              fontWeight: '800',
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px'
            }}>
              ภาพรวมสถานการณ์
            </h1>
            <p style={{
              margin: 0,
              color: 'var(--text-secondary)',
              fontSize: '0.9rem'
            }}>
              อัปเดตล่าสุด: {new Date().toLocaleString('th-TH', { 
                hour: '2-digit', 
                minute: '2-digit',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })} น.
            </p>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #dc2626, #ef4444)',
        padding: '20px 24px',
        borderRadius: '16px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          fontSize: '2rem',
          animation: 'pulse 2s infinite'
        }}>
          🚨
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 4px 0',
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: '700'
          }}>
            แจ้งเตือนสถานการณ์ฉุกเฉิน
          </h3>
          <p style={{
            margin: 0,
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.95rem'
          }}>
            มี <strong>12 ศูนย์</strong> ที่ต้องการความช่วยเหลือเร่งด่วน • กรุณาดำเนินการทันที
          </p>
        </div>
        <button style={{
          background: 'white',
          color: '#dc2626',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '0.9rem',
          transition: 'all 0.3s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          ดูรายละเอียด →
        </button>
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}
      </style>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {[
          { 
            title: 'ศูนย์พักพิงทั้งหมด', 
            value: stats.centers, 
            unit: 'แห่ง', 
            icon: '🏘️',
            gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
            change: '+8 แห่ง'
          },
          { 
            title: 'รายการสิ่งของทั้งหมด', 
            value: stats.items, 
            unit: 'รายการ', 
            icon: '📦',
            gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
            change: '+124 รายการ'
          },
          { 
            title: 'ศูนย์ฉุกเฉิน', 
            value: stats.critical, 
            unit: 'แห่ง วิกฤติ', 
            icon: '🔴',
            gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
            change: '-2 แห่ง'
          }
        ].map((stat, idx) => (
          <div key={idx} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            transition: 'all 0.3s',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: stat.gradient,
              opacity: 0.1
            }} />
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: stat.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)'
              }}>
                {stat.icon}
              </div>
              <div style={{
                background: idx === 2 ? '#fef2f2' : '#f0fdf4',
                color: idx === 2 ? '#dc2626' : '#16a34a',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {stat.change}
              </div>
            </div>

            <h4 style={{
              margin: '0 0 8px 0',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              {stat.title}
            </h4>

            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px'
            }}>
              <span style={{
                fontSize: '2.5rem',
                fontWeight: '900',
                color: 'var(--text-primary)',
                lineHeight: 1
              }}>
                {loading ? '...' : stat.value.toLocaleString()}
              </span>
              <span style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                fontWeight: '600'
              }}>
                {stat.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Inventory Section */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem'
            }}>
              ⚠️
            </div>
            <h3 style={{
              margin: 0,
              fontSize: '1.3rem',
              fontWeight: '700',
              color: 'var(--text-primary)'
            }}>
              สิ่งของที่วิกฤตมากที่สุด
            </h3>
          </div>
          <button style={{
            background: 'transparent',
            border: '1px solid var(--border-color)',
            padding: '8px 16px',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'var(--bg-primary)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}>
            ดูทั้งหมด →
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {criticalItems.map((item, idx) => {
            const statusColors = {
              critical: { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', label: 'วิกฤติ' },
              warning: { bg: '#fffbeb', border: '#fcd34d', text: '#f59e0b', label: 'ต่ำ' },
              normal: { bg: '#f0fdf4', border: '#86efac', text: '#16a34a', label: 'ปกติ' }
            };
            const status = statusColors[item.status as keyof typeof statusColors];

            return (
              <div key={idx} style={{
                background: 'var(--bg-primary)',
                border: `1px solid ${status.border}`,
                borderRadius: '12px',
                padding: '16px',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    fontSize: '2rem'
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      margin: '0 0 4px 0',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      {item.name}
                    </h4>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: '#e5e7eb',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${item.percent}%`,
                        height: '100%',
                        background: status.text,
                        borderRadius: '3px',
                        transition: 'width 0.5s'
                      }} />
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    fontWeight: '500'
                  }}>
                    {item.amount}
                  </span>
                  <span style={{
                    background: status.bg,
                    color: status.text,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart and Quick Actions Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {/* Chart */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem'
            }}>
              📈
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: '700',
                color: 'var(--text-primary)'
              }}>
                แนวโน้มข้อมูล
              </h3>
              <p style={{
                margin: 0,
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}>
                สรุป 7 วันที่ผ่านมา
              </p>
            </div>
          </div>
          <SimpleLineChart data={chartData} />
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {[
            { 
              title: 'ดูภาพรวมศูนย์พักพิง', 
              icon: '🏘️', 
              gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              action: 'centers'
            },
            { 
              title: 'ดูสต็อกสิ่งของ', 
              icon: '📦', 
              gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
              action: 'inventory'
            }
          ].map((action, idx) => (
            <div key={idx} style={{
              background: action.gradient,
              borderRadius: '16px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                fontSize: '8rem',
                opacity: 0.15
              }}>
                {action.icon}
              </div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  fontSize: '2.5rem',
                  marginBottom: '12px'
                }}>
                  {action.icon}
                </div>
                <h3 style={{
                  margin: 0,
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}>
                  {action.title}
                </h3>
              </div>

              <button style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s',
                alignSelf: 'flex-start'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}>
                เข้าดู →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type SimpleLineChartProps = {
  data: number[];
  color?: string;
  height?: number;
};

function SimpleLineChart({ data, color = '#3b82f6', height = 150 }: SimpleLineChartProps) {
  const w = 600;
  const h = height;
  const max = Math.max(...data, 1);

  const { pathD, areaD, points } = useMemo(() => {
    const pts = data.map((v, i) => {
      const x = (i / Math.max(1, data.length - 1)) * (w - 40) + 20;
      const y = h - (v / max) * (h - 40) - 20;
      return { x, y };
    });

    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const area = `${path} L ${w - 20} ${h - 20} L 20 ${h - 20} Z`;
    return { pathD: path, areaD: area, points: pts };
  }, [data, h, max, w]);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{
      width: '100%',
      height: 'auto',
      display: 'block'
    }}>
      <defs>
        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={areaD} fill="url(#chartGradient)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={color} />
      ))}
    </svg>
  );
}