import React from 'react';
import { Wallet } from 'lucide-react';
const PaymentsPage = () => (
  <div className="p-10 flex flex-col items-center justify-center h-[50vh] text-gray-400">
    <Wallet className="w-16 h-16 mb-4 opacity-20" />
    <h2 className="text-xl font-bold">Pagos y Recargas</h2>
    <p>Módulo de gestión financiera.</p>
  </div>
);
export default PaymentsPage;