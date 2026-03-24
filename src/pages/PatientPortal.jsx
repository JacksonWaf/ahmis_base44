import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, User, Calendar, FileText, MessageSquare, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import PortalAppointments from '@/components/portal/PortalAppointments';
import PortalReports from '@/components/portal/PortalReports';
import PortalMessages from '@/components/portal/PortalMessages';

export default function PatientPortal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => base44.entities.HealthWorker.filter({ role: 'doctor' }),
  });

  const filtered = patients.filter(p => {
    const name = `${p.first_name} ${p.last_name}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || p.phone?.includes(searchTerm) || p.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!selectedPatient) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Patient Portal</h1>
            <p className="text-muted-foreground mt-1 text-sm">Search for your name to access your medical records</p>
          </div>

          <Card className="p-6 shadow-sm">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            {searchTerm.length > 0 && (
              <div className="border rounded-xl overflow-hidden">
                {isLoading && <div className="p-4 text-sm text-muted-foreground text-center">Searching...</div>}
                {!isLoading && filtered.length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground text-center">No patient found. Please contact reception.</div>
                )}
                {filtered.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className="w-full text-left px-4 py-3 hover:bg-muted/30 border-b last:border-0 transition-colors flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{p.first_name} {p.last_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.gender && <span className="capitalize">{p.gender}</span>}
                        {p.date_of_birth && <span> · DOB: {p.date_of_birth}</span>}
                        {p.phone && <span> · {p.phone}</span>}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  const fullName = `${selectedPatient.first_name} ${selectedPatient.last_name}`;

  return (
    <div>
      {/* Portal Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{fullName}</h1>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                <ShieldCheck className="w-3 h-3 mr-1" /> Verified
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedPatient.gender && <span className="capitalize">{selectedPatient.gender}</span>}
              {selectedPatient.blood_type && <span className="ml-2 font-medium text-red-600">Blood: {selectedPatient.blood_type}</span>}
              {selectedPatient.insurance_provider && <span className="ml-2">· {selectedPatient.insurance_provider}</span>}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSelectedPatient(null)} className="gap-2 text-muted-foreground">
          <LogOut className="w-4 h-4" /> Switch Patient
        </Button>
      </div>

      {selectedPatient.allergies && (
        <div className="mb-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-center gap-2">
          ⚠️ <strong>Allergies:</strong> {selectedPatient.allergies}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="appointments">
        <TabsList className="mb-6">
          <TabsTrigger value="appointments" className="gap-2">
            <Calendar className="w-4 h-4" /> Appointments
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="w-4 h-4" /> Medical Reports
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare className="w-4 h-4" /> Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <PortalAppointments patientName={fullName} />
        </TabsContent>

        <TabsContent value="reports">
          <PortalReports patientId={selectedPatient.id} patientName={fullName} />
        </TabsContent>

        <TabsContent value="messages">
          <PortalMessages
            patientId={selectedPatient.id}
            patientName={fullName}
            patientEmail={selectedPatient.email}
            doctors={doctors}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}