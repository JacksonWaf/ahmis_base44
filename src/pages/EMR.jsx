import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import PatientTimeline from '@/components/emr/PatientTimeline';

export default function EMR() {
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const filtered = patients.filter(p => {
    const name = `${p.first_name} ${p.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase()) || p.phone?.includes(search);
  });

  return (
    <div className="flex h-[calc(100vh-80px)] gap-0 -m-6">
      {/* Patient List Panel */}
      <div className="w-72 flex-shrink-0 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg mb-3">EMR — Patient Records</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search patient..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No patients found.</div>
          ) : filtered.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPatient(p)}
              className={cn(
                "w-full text-left px-4 py-3 border-b hover:bg-muted/40 transition-colors",
                selectedPatient?.id === p.id && "bg-primary/5 border-l-2 border-l-primary"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{p.first_name} {p.last_name}</p>
                  <p className="text-xs text-muted-foreground">{p.gender} · {p.blood_type || 'No blood type'}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Panel */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {selectedPatient ? (
          <PatientTimeline patient={selectedPatient} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <User className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">Select a patient</p>
            <p className="text-sm">Choose a patient from the left to view their medical history.</p>
          </div>
        )}
      </div>
    </div>
  );
}