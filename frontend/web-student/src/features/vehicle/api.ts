import { vehicleHttp } from '@/core/http';

export const getMyVehicles = async () => {
  const res = await vehicleHttp.get('/vehicles');
  return res.data;
};
