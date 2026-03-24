import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

export default function DoctorCalendar({ appointments, doctors, onSelectDay, onEditAppointment }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedDay, setSelectedDay] = useState(null);

  const days = useMemo(() => {
    return eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  }, [currentMonth]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => selectedDoctor === 'all' || a.doctor_name === selectedDoctor);
  }, [appointments, selectedDoctor]);

  const apptsByDay = useMemo(() => {
    const map = {};
    filteredAppointments.forEach(a => {
      if (!a.date) return;
      map[a.date] = map[a.date] || [];
      map[a.date].push(a);
    });
    return map;
  }, [filteredAppointments]);

  const dayAppointments = selectedDay ? (apptsByDay[format(selectedDay, 'yyyy-MM-dd')] || []) : [];

  const firstDay = startOfMonth(currentMonth).getDay();

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Calendar Grid */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger className="w-48"><SelectValue placeholder="All doctors" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {doctors.map(d => {
                const name = `Dr. ${d.first_name} ${d.last_name}`;
                return <SelectItem key={d.id} value={name}>{name}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="p-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array(firstDay).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] border-b border-r bg-slate-50/50" />
            ))}
            {days.map(day => {
              const key = format(day, 'yyyy-MM-dd');
              const dayApts = apptsByDay[key] || [];
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const today = isToday(day);
              return (
                <div
                  key={key}
                  onClick={() => { setSelectedDay(day); onSelectDay?.(day); }}
                  className={cn(
                    "min-h-[80px] border-b border-r p-1.5 cursor-pointer transition-colors",
                    isSelected ? "bg-primary/5 ring-2 ring-inset ring-primary/30" : "hover:bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1",
                    today ? "bg-primary text-primary-foreground" : "text-foreground"
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayApts.slice(0, 3).map(a => (
                      <div key={a.id} className={cn(
                        "text-[10px] rounded px-1 py-0.5 truncate font-medium",
                        a.status === 'cancelled' ? "bg-red-100 text-red-600" :
                        a.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                        a.status === 'no_show' ? "bg-slate-100 text-slate-500" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {a.time && `${a.time} `}{a.patient_name}
                      </div>
                    ))}
                    {dayApts.length > 3 && (
                      <div className="text-[10px] text-muted-foreground px-1">+{dayApts.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day detail panel */}
      <div className="w-full lg:w-72 flex-shrink-0">
        <div className="bg-white rounded-xl border shadow-sm p-4 sticky top-4">
          <h3 className="font-semibold mb-3 text-sm">
            {selectedDay ? format(selectedDay, 'EEEE, MMM d') : 'Select a day'}
          </h3>
          {!selectedDay && <p className="text-sm text-muted-foreground">Click a day to see its appointments.</p>}
          {selectedDay && dayAppointments.length === 0 && (
            <p className="text-sm text-muted-foreground">No appointments on this day.</p>
          )}
          <div className="space-y-2">
            {dayAppointments
              .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
              .map(a => (
                <div
                  key={a.id}
                  onClick={() => onEditAppointment(a)}
                  className="border rounded-lg p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-primary">{a.time || 'No time'}</span>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-sm font-medium">{a.patient_name}</p>
                  <p className="text-xs text-muted-foreground">{a.doctor_name}</p>
                  {a.reason && <p className="text-xs text-muted-foreground mt-1 truncate">{a.reason}</p>}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}