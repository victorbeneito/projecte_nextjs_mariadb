"use client";

import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  importe: string;
  orderId: string;
}

export default function PasarelaPaypal({ isOpen, onClose, onSuccess, importe, orderId }: Props) {
  const [step, setStep] = useState<'review' | 'processing' | 'success'>('review');
  
  // 🆕 NUEVO ESTADO: Para saber qué ha elegido el usuario ('card' o 'balance')
  const [fundingSource, setFundingSource] = useState<'card' | 'balance'>('card');

  // Reiniciar estado al abrir
  if (!isOpen && step !== 'review') {
      setTimeout(() => {
          setStep('review');
          setFundingSource('card'); // Resetear a tarjeta por defecto
      }, 500); 
      return null;
  }
  
  if (!isOpen) return null;

  const handlePay = () => {
    setStep('processing');
    // Simular retardo de red
    setTimeout(() => {
      setStep('success');
    }, 2500);
  };

  return (
    // BACKDROP OSCURO
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in font-sans">
      
      {/* --- VENTANA MODAL PAYPAL --- */}
      <div className="bg-white w-full max-w-md h-auto rounded-lg shadow-2xl relative overflow-hidden flex flex-col animate-scale-in">
        
        {/* CABECERA CON LOGO */}
        <div className="bg-white border-b border-gray-100 p-4 flex justify-center relative">
            <span className="text-[#003087] font-bold italic text-2xl tracking-tighter">
                Pay<span className="text-[#009cde]">Pal</span>
            </span>
            
            {step !== 'success' && (
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            )}
        </div>

        {/* CONTENIDO CAMBIANTE */}
        <div className="flex-1 overflow-y-auto">
            
            {/* --- PASO 1: REVISAR Y PAGAR --- */}
            {step === 'review' && (
                <div className="p-8">
                    {/* Resumen Superior */}
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <div className="text-gray-600 text-sm">
                            <p>Compra en</p>
                            <p className="font-bold text-black">El Hogar de tus Sueños</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-normal text-black">{importe} €</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm text-gray-500 mb-3">Hola, Cliente:</p>
                        <h3 className="text-xl text-[#2c2e2f] mb-4">Pagar con</h3>
                        
                        <div className="space-y-3">
                            {/* OPCIÓN 1: TARJETA */}
                            <div 
                                onClick={() => setFundingSource('card')}
                                className={`border rounded p-4 flex items-center gap-4 cursor-pointer transition-all ${
                                    fundingSource === 'card' 
                                    ? 'border-[#0070ba] bg-[#f5f7fa] shadow-sm ring-1 ring-[#0070ba]' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                {/* Radio Button Simulado */}
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                    fundingSource === 'card' ? 'border-[#0070ba]' : 'border-gray-400'
                                }`}>
                                    {fundingSource === 'card' && <div className="w-2.5 h-2.5 bg-[#0070ba] rounded-full"></div>}
                                </div>

                                <div className="w-10 h-6 bg-white border rounded flex items-center justify-center shadow-sm">
                                    <div className="w-6 h-4 bg-orange-500 rounded-sm"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-[#2c2e2f]">Mastercard</p>
                                    <p className="text-xs text-gray-500">Tarjeta terminada en x-8842</p>
                                </div>
                            </div>
                            
                            {/* OPCIÓN 2: SALDO PAYPAL */}
                            <div 
                                onClick={() => setFundingSource('balance')}
                                className={`border rounded p-4 flex items-center gap-4 cursor-pointer transition-all ${
                                    fundingSource === 'balance' 
                                    ? 'border-[#0070ba] bg-[#f5f7fa] shadow-sm ring-1 ring-[#0070ba]' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                {/* Radio Button Simulado */}
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                    fundingSource === 'balance' ? 'border-[#0070ba]' : 'border-gray-400'
                                }`}>
                                    {fundingSource === 'balance' && <div className="w-2.5 h-2.5 bg-[#0070ba] rounded-full"></div>}
                                </div>

                                <div className="w-10 h-6 bg-white border rounded flex items-center justify-center shadow-sm text-[#003087] font-bold italic text-xs">
                                    P
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-[#2c2e2f]">Saldo de PayPal</p>
                                    <p className="text-xs text-gray-500">Disponible: 150,00 €</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-6 text-center leading-relaxed">
                        Si haces clic en <strong>Pagar Ahora</strong>, se utilizará {fundingSource === 'card' ? 'su tarjeta Mastercard' : 'su saldo de PayPal'} para completar la compra.
                    </p>

                    <button 
                        onClick={handlePay}
                        className="w-full bg-[#0070ba] hover:bg-[#003087] text-white font-bold py-3 rounded-full transition-colors text-lg shadow-md"
                    >
                        Pagar Ahora
                    </button>
                    
                    <button onClick={onClose} className="w-full mt-4 text-[#0070ba] font-bold text-sm hover:underline">
                        Cancelar y volver
                    </button>
                </div>
            )}

            {/* --- PASO 2: PROCESANDO --- */}
            {step === 'processing' && (
                <div className="p-12 flex flex-col items-center justify-center h-full min-h-[300px]">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-[#0070ba] rounded-full animate-spin mb-6"></div>
                    <h3 className="text-xl font-bold text-[#2c2e2f]">Procesando pago con {fundingSource === 'card' ? 'Tarjeta' : 'Saldo PayPal'}...</h3>
                    <p className="text-gray-500 mt-2 text-sm">No cierre esta ventana, por favor.</p>
                </div>
            )}

            {/* --- PASO 3: ÉXITO --- */}
            {step === 'success' && (
                <div className="p-8 text-center animate-fade-in">
                    <div className="w-20 h-20 mx-auto mb-6 relative">
                        <div className="absolute inset-0 border-2 border-[#0070ba] rounded-full opacity-20 animate-ping"></div>
                        <div className="w-full h-full rounded-full border-2 border-[#0070ba] flex items-center justify-center">
                            <svg className="w-10 h-10 text-[#0070ba]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                    </div>

                    <h2 className="text-2xl font-normal text-[#2c2e2f] mb-2">Ha pagado <span className="font-bold">{importe} EUR</span></h2>
                    <p className="text-sm text-gray-500 mb-8">a El Hogar de tus Sueños</p>

                    <div className="bg-gray-50 rounded p-4 text-left text-sm mb-8 border border-gray-100">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">ID de transacción:</span>
                            <span className="font-bold text-black">{orderId}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                             <span className="text-gray-600">Método de pago:</span>
                             <span className="font-bold text-black">{fundingSource === 'card' ? 'Mastercard x-8842' : 'Saldo PayPal'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Fecha:</span>
                            <span className="font-bold text-black">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    <button 
                        onClick={onSuccess}
                        className="w-full bg-[#0070ba] hover:bg-[#003087] text-white font-bold py-3 rounded-full transition-colors shadow-lg mb-4"
                    >
                        Volver al sitio del vendedor
                    </button>
                </div>
            )}
        </div>
        
        {/* FOOTER GENERAL */}
        <div className="bg-[#f7f9fa] py-3 text-center text-[10px] text-gray-500 border-t border-gray-200">
             PayPal &copy; 1999-{new Date().getFullYear()} Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}