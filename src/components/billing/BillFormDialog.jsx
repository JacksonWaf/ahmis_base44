import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Loader2 } from 'lucide-react';

const emptyItem = { description: '', category: '', quantity: 1, unit_price: 0, total: 0 };

export default function BillFormDialog({ open, onOpenChange, bill, onSubmit, isSubmitting }) {
  const [form, setForm] = useState({});
  const [items, setItems] = useState([{ ...emptyItem }]);

  useEffect(() => {
    if (open) {
      setForm({
        patient_name: bill?.patient_name || '',
        bill_number: bill?.bill_number || `BILL-${Date.now().toString(36).toUpperCase()}`,
        bill_date: bill?.bill_date || new Date().toISOString().split('T')[0],
        tax: bill?.tax || 0,
        discount: bill?.discount || 0,
        amount_paid: bill?.amount_paid || 0,
        insurance_covered: bill?.insurance_covered || 0,
        payment_method: bill?.payment_method || '',
        notes: bill?.notes || '',
        status: bill?.status || 'draft',
      });
      setItems(bill?.items?.length ? bill.items : [{ ...emptyItem }]);
    }
  }, [open, bill]);

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total = (updated[index].quantity || 0) * (updated[index].unit_price || 0);
    }
    setItems(updated);
  };

  const subtotal = items.reduce((s, i) => s + (i.total || 0), 0);
  const totalAmount = subtotal + (Number(form.tax) || 0) - (Number(form.discount) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, items, subtotal, total_amount: totalAmount });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bill ? 'Edit Bill' : 'New Bill'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Patient Name *</Label>
              <Input value={form.patient_name || ''} onChange={e => setForm({ ...form, patient_name: e.target.value })} required />
            </div>
            <div>
              <Label className="text-xs">Bill Number</Label>
              <Input value={form.bill_number || ''} onChange={e => setForm({ ...form, bill_number: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Bill Date</Label>
              <Input type="date" value={form.bill_date || ''} onChange={e => setForm({ ...form, bill_date: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Payment Method</Label>
              <Select value={form.payment_method || ''} onValueChange={v => setForm({ ...form, payment_method: v })}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  {['cash','card','insurance','bank_transfer','mobile_money'].map(m => (
                    <SelectItem key={m} value={m}>{m.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold">Line Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, { ...emptyItem }])} className="gap-1">
                <Plus className="w-3 h-3" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    {idx === 0 && <Label className="text-xs">Description</Label>}
                    <Input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Service/Item" />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <Label className="text-xs">Category</Label>}
                    <Input value={item.category} onChange={e => updateItem(idx, 'category', e.target.value)} placeholder="Cat." />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <Label className="text-xs">Qty</Label>}
                    <Input type="number" min={0} value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <Label className="text-xs">Price</Label>}
                    <Input type="number" min={0} step="0.01" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', Number(e.target.value))} />
                  </div>
                  <div className="col-span-1 text-right text-sm font-medium pt-1">GMD {(item.total || 0).toFixed(2)}</div>
                  <div className="col-span-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => setItems(items.filter((_, i) => i !== idx))} disabled={items.length === 1}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Tax (GMD)</Label>
              <Input type="number" min={0} value={form.tax || 0} onChange={e => setForm({ ...form, tax: Number(e.target.value) })} />
            </div>
            <div>
              <Label className="text-xs">Discount (GMD)</Label>
              <Input type="number" min={0} value={form.discount || 0} onChange={e => setForm({ ...form, discount: Number(e.target.value) })} />
            </div>
            <div>
              <Label className="text-xs">Amount Paid (GMD)</Label>
              <Input type="number" min={0} value={form.amount_paid || 0} onChange={e => setForm({ ...form, amount_paid: Number(e.target.value) })} />
            </div>
            <div>
              <Label className="text-xs">Insurance Covered (GMD)</Label>
              <Input type="number" min={0} value={form.insurance_covered || 0} onChange={e => setForm({ ...form, insurance_covered: Number(e.target.value) })} />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="font-semibold">Total Amount</span>
            <span className="text-xl font-bold">GMD {totalAmount.toFixed(2)}</span>
          </div>

          <div>
            <Label className="text-xs">Status</Label>
            <Select value={form.status || 'draft'} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['draft','pending','partially_paid','paid','overdue','cancelled'].map(s => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {bill ? 'Update Bill' : 'Create Bill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}