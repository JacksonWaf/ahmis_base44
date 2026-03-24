import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, FlaskConical, ScanLine,
  Wrench, Pill, Package, UserCog, Receipt, ChevronLeft, ChevronRight,
  Stethoscope, BarChart2, ClipboardList, ShieldCheck, Bed, Settings, Building2, ChevronsUpDown
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useFacility } from '@/lib/FacilityContext';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/Dashboard' },
  { label: 'OPD', icon: Stethoscope, path: '/OPD' },
  { label: 'Patients', icon: Users, path: '/Patients' },
  { label: 'EMR', icon: ClipboardList, path: '/EMR', isChild: true },
  { label: 'Inpatient', icon: Bed, path: '/Inpatient' },
  { label: 'Appointments', icon: Calendar, path: '/Appointments' },
  { label: 'Laboratory', icon: FlaskConical, path: '/Laboratory' },
  { label: 'Imaging', icon: ScanLine, path: '/Imaging' },
  { label: 'Equipment', icon: Wrench, path: '/Equipment' },
  { label: 'Pharmacy', icon: Pill, path: '/Pharmacy' },
  { label: 'Inventory', icon: Package, path: '/Inventory' },
  { label: 'Staff', icon: UserCog, path: '/Staff' },
  { label: 'Billing', icon: Receipt, path: '/Billing' },
  { label: 'Analytics', icon: BarChart2, path: '/Analytics' },
  { label: 'Patient Portal', icon: ShieldCheck, path: '/PatientPortal' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { user } = useAuth();
  const { facility, clearFacility } = useFacility();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col z-50 transition-all duration-300 border-r border-sidebar-border",
      collapsed ? "w-[68px]" : "w-[240px]"
    )}>
      <div className="flex items-center gap-3 px-3 h-16 border-b border-sidebar-border">
        <img
          src="https://media.base44.com/images/public/69bb219dcb66dbbed32fb154/39fda5ebb_image.png"
          alt="AHMIS Logo"
          className={cn("flex-shrink-0 object-contain", collapsed ? "w-10 h-10" : "w-10 h-10")}
        />
        {!collapsed && (
          <span className="font-bold text-base text-sidebar-primary-foreground tracking-tight">AHMIS</span>
        )}
      </div>

      {/* Facility indicator */}
      {facility && (
        <button
          onClick={clearFacility}
          className={cn(
            "flex items-center gap-2 mx-2 mt-2 px-3 py-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors",
            collapsed ? "justify-center" : ""
          )}
          title={collapsed ? `${facility.name} — Click to switch` : undefined}
        >
          <Building2 className="w-4 h-4 flex-shrink-0 text-sidebar-primary" />
          {!collapsed && (
            <>
              <span className="flex-1 text-xs font-medium text-sidebar-primary-foreground truncate">{facility.name}</span>
              <ChevronsUpDown className="w-3 h-3 text-sidebar-foreground/50 flex-shrink-0" />
            </>
          )}
        </button>
      )}

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, path, isChild }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isChild && !collapsed && "ml-4 pl-3 border-l border-sidebar-border text-[13px]",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className={cn("flex-shrink-0", isChild ? "w-4 h-4" : "w-5 h-5")} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {user?.role === 'admin' && (
        <Link
          to="/Facilities"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-200 mb-1",
            location.pathname === '/Facilities'
              ? "bg-sidebar-accent text-sidebar-primary"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Building2 className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Facilities</span>}
        </Link>
      )}
      {user?.role === 'admin' && (
        <Link
          to="/UserManagement"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-200 mb-1",
            location.pathname === '/UserManagement'
              ? "bg-sidebar-accent text-sidebar-primary"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>User Management</span>}
        </Link>
      )}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-12 border-t border-sidebar-border hover:bg-sidebar-accent transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}