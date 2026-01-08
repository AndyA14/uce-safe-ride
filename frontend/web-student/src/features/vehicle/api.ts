import { vehicleHttp } from '@/shared/http';

export const getMyVehicles = async () => {
  const res = await vehicleHttp.get('/vehicles');
  return res.data;
};
