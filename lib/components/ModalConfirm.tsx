import React from 'react';
import { Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ModalConfirmProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
    title: string;
    message: React.ReactNode;
    confirmLabel?: string;
    variant?: 'danger' | 'success' | 'info';
}

export default function ModalConfirm({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    title,
    message,
    confirmLabel = 'Ya, Lanjutkan',
    variant = 'danger'
}: ModalConfirmProps) {
    if (!isOpen) return null;

    const getColor = () => {
        switch (variant) {
            case 'success': return '#10b981';
            case 'info': return '#172433';
            case 'danger':
            default: return '#ef4444';
        }
    };

    const color = getColor();

    const getIcon = () => {
        if (variant === 'success') return <CheckCircle size={32} />;
        if (variant === 'info') return <Info size={32} />;
        return <AlertTriangle size={32} />;
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                padding: '30px',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '400px',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    width: '60px', height: '60px',
                    borderRadius: '50%',
                    backgroundColor: `${color}20`,
                    color: color,
                    margin: '0 auto 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {getIcon()}
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
                    {title}
                </h3>

                <div style={{ color: '#6b7280', marginBottom: '24px', fontSize: '15px', lineHeight: '1.5' }}>
                    {message}
                </div>

                {isLoading ? (
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        padding: '10px 0',
                        gap: '12px'
                    }}>
                        <Loader2 className="animate-spin" size={40} color={color} />
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                            Sedang memproses...
                        </span>
                    </div>
                ) : (
                    // TAMPILAN NORMAL (Tombol)
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                backgroundColor: '#ffffff',
                                color: '#374151',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Batal
                        </button>

                        <button
                            onClick={onConfirm}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: color,
                                color: '#ffffff',
                                fontWeight: '600',
                                cursor: 'pointer',
                                minWidth: '120px'
                            }}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}