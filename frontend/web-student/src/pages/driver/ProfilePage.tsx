import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDriverProfile, DriverProfile } from '@/services/driverService'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, CreditCard, IdCard, CircleCheck, AlertCircle } from 'lucide-react';



export default function ProfilePage() {
  const { user } = useAuth();
  
  // ✅ USAR LA INTERFAZ IMPORTADA EN EL STATE
  const [driverData, setDriverData] = useState<DriverProfile | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        if (user) {
          const data = await getDriverProfile(); 
          setDriverData(data);
        }
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la información del conductor.');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500">Cargando perfil...</span>
      </div>
    );
  }

  if (!user) {
    return <div className="p-8 text-center text-red-500">No hay sesión activa</div>;
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge className="bg-green-500 hover:bg-green-600">Disponible</Badge>;
      case 'ON_ROUTE':
        return <Badge className="bg-blue-500 hover:bg-blue-600">En Ruta</Badge>;
      case 'OFFLINE':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Desconectado</Badge>;
      case 'BUSY':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Ocupado</Badge>;
      default:
        return <Badge variant="outline">Sin estado</Badge>;
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-500 mt-1">Información personal y estado del conductor</p>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Estado Actual</CardTitle>
                <CardDescription>Tu disponibilidad en el sistema</CardDescription>
              </div>
              {getStatusBadge(driverData?.status)}
            </div>
          </CardHeader>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <User className="h-4 w-4" /> Nombre Completo
                </p>
                <p className="text-base font-medium">{user.name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Correo Electrónico
                </p>
                <p className="text-base font-medium">{user.email}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Teléfono
                </p>
                <p className="text-base font-medium">{user.phone || 'No registrado'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <IdCard className="h-4 w-4" /> Cédula de Identidad
                </p>
                <p className="text-base font-medium">{driverData?.ci || '---'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Credenciales de Conductor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <CircleCheck className="h-4 w-4" /> Número de Licencia
                </p>
                <p className="text-base font-medium">{driverData?.license_number || '---'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">ID de Conductor</p>
                <p className="text-xs font-mono text-gray-600">{driverData?.id || user.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
