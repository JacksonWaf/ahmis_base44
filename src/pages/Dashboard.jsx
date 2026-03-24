import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import StatCard from '@/components/shared/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import { Users, Calendar, FlaskConical, Receipt, Pill, Package, UserCog, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useFacility } from '@/lib/FacilityContext';

export default function Dashboard() {
  const { facilityId, facility } = useFacility();
  const { data: patients = [] } = useQuery({ queryKey: ['patients', facilityId], queryFn: () => base44.entities.Patient.filter({ facility_id: facilityId }), enabled: !!facilityId });
  const { data: appointments = [] } = useQuery({ queryKey: ['appointments', facilityId], queryFn: () => base44.entities.Appointment.filter({ facility_id: facilityId }, '-created_date'), enabled: !!facilityId });
  const { data: labTests = [] } = useQuery({ queryKey: ['labTests', facilityId], queryFn: () => base44.entities.LabTest.filter({ facility_id: facilityId }), enabled: !!facilityId });
  const { data: bills = [] } = useQuery({ queryKey: ['bills', facilityId], queryFn: () => base44.entities.Bill.filter({ facility_id: facilityId }), enabled: !!facilityId });
  const { data: medications = [] } = useQuery({ queryKey: ['medications', facilityId], queryFn: () => base44.entities.Medication.filter({ facility_id: facilityId }), enabled: !!facilityId });
  const { data: inventory = [] } = useQuery({ queryKey: ['inventory', facilityId], queryFn: () => base44.entities.InventoryItem.filter({ facility_id: facilityId }), enabled: !!facilityId });
  const { data: staff = [] } = useQuery({ queryKey: ['staff', facilityId], queryFn: () => base44.entities.HealthWorker.filter({ facility_id: facilityId }), enabled: !!facilityId });

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  const pendingLabs = labTests.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const lowStockMeds = medications.filter(m => m.stock_quantity <= m.reorder_level);
  const lowStockItems = inventory.filter(i => i.quantity_in_stock <= i.reorder_level);
  const pendingBills = bills.filter(b => b.status === 'pending' || b.status === 'overdue');
  const totalRevenue = bills.filter(b => b.status === 'paid').reduce((s, b) => s + (b.total_amount || 0), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{facility?.name || 'Dashboard'}</h1>
        <p className="text-muted-foreground text-sm mt-1">Hospital Management Information System</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Patients" value={patients.length} icon={Users} trendLabel={`${patients.filter(p => p.status === 'admitted').length} admitted`} />
        <StatCard title="Today's Appointments" value={todayAppointments.length} icon={Calendar} trendLabel={`${appointments.filter(a=>a.status==='scheduled').length} upcoming`} />
        <StatCard title="Pending Lab Tests" value={pendingLabs.length} icon={FlaskConical} trendLabel={`${labTests.filter(t=>t.priority==='stat').length} STAT`} trend={labTests.filter(t=>t.priority==='stat').length > 0 ? 'down' : undefined} />
        <StatCard title="Revenue" value={`GMD ${totalRevenue.toLocaleString()}`} icon={Receipt} trendLabel={`${pendingBills.length} pending bills`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Appointments</CardTitle>
              <Link to="/Appointments" className="text-xs text-primary font-medium hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments.slice(0, 6).map(apt => (
                <div key={apt.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">{apt.patient_name?.[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{apt.patient_name}</p>
                      <p className="text-xs text-muted-foreground">{apt.doctor_name} • {apt.department}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{apt.date} {apt.time}</span>
                    <StatusBadge status={apt.status} />
                  </div>
                </div>
              ))}
              {appointments.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No appointments yet</p>}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCog className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Active Staff</span>
                </div>
                <span className="text-sm font-semibold">{staff.filter(s => s.status === 'active').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Low Stock Meds</span>
                </div>
                <span className="text-sm font-semibold text-amber-600">{lowStockMeds.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Low Inventory</span>
                </div>
                <span className="text-sm font-semibold text-amber-600">{lowStockItems.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Total Medications</span>
                </div>
                <span className="text-sm font-semibold">{medications.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {lowStockMeds.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-xs font-medium text-amber-800">{lowStockMeds.length} medication(s) low on stock</p>
                </div>
              )}
              {pendingBills.length > 0 && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-xs font-medium text-red-700">{pendingBills.length} pending/overdue bill(s)</p>
                </div>
              )}
              {lowStockMeds.length === 0 && pendingBills.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No alerts</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}