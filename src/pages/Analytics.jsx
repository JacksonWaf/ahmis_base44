import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/shared/StatCard';
import { TrendingUp, Users, FlaskConical, DollarSign, Pill } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';

const COLORS = ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#84cc16'];

export default function Analytics() {
  const { data: encounters = [] } = useQuery({ queryKey: ['encounters'], queryFn: () => base44.entities.ClinicalEncounter.list() });
  const { data: bills = [] } = useQuery({ queryKey: ['bills'], queryFn: () => base44.entities.Bill.list() });
  const { data: labTests = [] } = useQuery({ queryKey: ['labTests'], queryFn: () => base44.entities.LabTest.list() });
  const { data: prescriptions = [] } = useQuery({ queryKey: ['prescriptions'], queryFn: () => base44.entities.Prescription.list() });
  const { data: patients = [] } = useQuery({ queryKey: ['patients'], queryFn: () => base44.entities.Patient.list() });
  const { data: appointments = [] } = useQuery({ queryKey: ['appointments'], queryFn: () => base44.entities.Appointment.list() });

  // OPD attendance last 14 days
  const opdTrend = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = subDays(new Date(), 13 - i);
      const key = format(d, 'yyyy-MM-dd');
      return { date: format(d, 'MMM d'), key };
    });
    return days.map(({ date, key }) => ({
      date,
      Encounters: encounters.filter(e => e.encounter_date === key).length,
      Appointments: appointments.filter(a => a.date === key).length,
    }));
  }, [encounters, appointments]);

  // Diagnoses frequency
  const diagnosesData = useMemo(() => {
    const counts = {};
    encounters.forEach(e => {
      if (!e.diagnosis) return;
      // Split multi-diagnoses and take the first meaningful word group
      const diag = e.diagnosis.trim().split('\n')[0].substring(0, 40);
      counts[diag] = (counts[diag] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [encounters]);

  // Department encounter breakdown
  const deptData = useMemo(() => {
    const counts = {};
    appointments.forEach(a => {
      if (!a.department) return;
      const d = a.department.replace(/\b\w/g, l => l.toUpperCase());
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [appointments]);

  // Drug utilization — top prescribed medications
  const drugData = useMemo(() => {
    const counts = {};
    prescriptions.forEach(p => {
      if (!p.medication_name) return;
      counts[p.medication_name] = (counts[p.medication_name] || 0) + (p.quantity || 1);
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, qty]) => ({ name, qty }));
  }, [prescriptions]);

  // Revenue by payment method
  const revenueByMethod = useMemo(() => {
    const totals = {};
    bills.forEach(b => {
      if (!b.payment_method || !b.total_amount) return;
      const m = b.payment_method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      totals[m] = (totals[m] || 0) + b.total_amount;
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [bills]);

  // Revenue over time (last 14 days)
  const revenueTrend = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = subDays(new Date(), 13 - i);
      const key = format(d, 'yyyy-MM-dd');
      const dayBills = bills.filter(b => b.bill_date === key);
      return {
        date: format(d, 'MMM d'),
        Revenue: dayBills.reduce((s, b) => s + (b.total_amount || 0), 0),
        Collected: dayBills.reduce((s, b) => s + (b.amount_paid || 0), 0),
      };
    });
    return days;
  }, [bills]);

  // Lab tests by type
  const labData = useMemo(() => {
    const counts = {};
    labTests.forEach(t => {
      const type = (t.test_type || 'other').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [labTests]);

  // Summary stats
  const totalRevenue = bills.reduce((s, b) => s + (b.total_amount || 0), 0);
  const totalCollected = bills.reduce((s, b) => s + (b.amount_paid || 0), 0);
  const collectionRate = totalRevenue > 0 ? ((totalCollected / totalRevenue) * 100).toFixed(1) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Analytics & Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">Hospital performance and utilization insights</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Patients" value={patients.length} icon={Users} trendLabel={`${patients.filter(p => p.status === 'admitted').length} admitted`} />
        <StatCard title="OPD Encounters" value={encounters.length} icon={TrendingUp} trendLabel={`${encounters.filter(e => e.status === 'completed').length} completed`} />
        <StatCard title="Total Revenue" value={`GMD ${totalRevenue.toLocaleString()}`} icon={DollarSign} trendLabel={`${collectionRate}% collected`} />
        <StatCard title="Prescriptions" value={prescriptions.length} icon={Pill} trendLabel={`${prescriptions.filter(p => p.status === 'pending').length} pending`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* OPD Attendance Trend */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">OPD Attendance — Last 14 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={opdTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Encounters" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Appointments" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Revenue Trend — Last 14 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `GMD ${v.toFixed(2)}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Revenue" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Collected" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue by Payment Method */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Revenue by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueByMethod.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={revenueByMethod} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {revenueByMethod.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `GMD ${v.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {revenueByMethod.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium">GMD {item.value.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <EmptyChart />}
          </CardContent>
        </Card>

        {/* Appointments by Department */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Appointments by Department</CardTitle>
          </CardHeader>
          <CardContent>
            {deptData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={deptData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {deptData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <EmptyChart />}
          </CardContent>
        </Card>

        {/* Lab Tests by Type */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Lab Tests by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {labData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={labData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {labData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {labData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <EmptyChart />}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Common Diagnoses */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Most Common Diagnoses</CardTitle>
          </CardHeader>
          <CardContent>
            {diagnosesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={diagnosesData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart label="No diagnoses recorded yet. Complete OPD encounters to see data." />}
          </CardContent>
        </Card>

        {/* Drug Utilization */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Drug Utilization (Top Prescribed)</CardTitle>
          </CardHeader>
          <CardContent>
            {drugData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={drugData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                  <Tooltip />
                  <Bar dataKey="qty" fill="#10b981" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart label="No prescriptions yet. Issue prescriptions via OPD to see data." />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyChart({ label = "No data available yet." }) {
  return (
    <div className="h-48 flex items-center justify-center text-sm text-muted-foreground text-center px-4">
      {label}
    </div>
  );
}