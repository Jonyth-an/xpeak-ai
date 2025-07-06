"use client";

import React, { useState, useEffect } from "react";
import { Card, Text, Button, Input, Select } from '@/app/components/ui';
import { useAuth } from '@/lib/AuthContext';

interface BillingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface TaxInformation {
  tax_id?: string;
  tax_id_type?: 'vat' | 'gst' | 'hst' | 'pst' | 'qst' | 'other';
  tax_exempt?: boolean;
  tax_exempt_reason?: string;
}

interface ReceiptPreferences {
  email_receipts?: boolean;
  receipt_email?: string;
  auto_download?: boolean;
  include_tax_breakdown?: boolean;
}

interface BillingInformation {
  name?: string;
  email?: string;
  phone?: string;
  address?: BillingAddress;
  tax_info?: TaxInformation;
  receipt_prefs?: ReceiptPreferences;
}

interface BillingInformationFormProps {
  initialData?: BillingInformation;
  onSave?: (data: BillingInformation) => void;
  onCancel?: () => void;
  isOpen: boolean;
}

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
  { value: 'IN', label: 'India' },
  { value: 'BR', label: 'Brazil' },
  { value: 'MX', label: 'Mexico' },
  // Add more countries as needed
];

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

const TAX_ID_TYPES = [
  { value: 'vat', label: 'VAT (Value Added Tax)' },
  { value: 'gst', label: 'GST (Goods and Services Tax)' },
  { value: 'hst', label: 'HST (Harmonized Sales Tax)' },
  { value: 'pst', label: 'PST (Provincial Sales Tax)' },
  { value: 'qst', label: 'QST (Quebec Sales Tax)' },
  { value: 'other', label: 'Other' },
];

export default function BillingInformationForm({
  initialData,
  onSave,
  onCancel,
  isOpen
}: BillingInformationFormProps) {
  const { user, session } = useAuth();
  const [formData, setFormData] = useState<BillingInformation>({
    name: '',
    email: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US'
    },
    tax_info: {
      tax_id: '',
      tax_id_type: 'vat',
      tax_exempt: false,
      tax_exempt_reason: ''
    },
    receipt_prefs: {
      email_receipts: true,
      receipt_email: '',
      auto_download: false,
      include_tax_breakdown: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: {
          line1: initialData.address?.line1 || '',
          line2: initialData.address?.line2 || '',
          city: initialData.address?.city || '',
          state: initialData.address?.state || '',
          postal_code: initialData.address?.postal_code || '',
          country: initialData.address?.country || 'US'
        },
        tax_info: {
          tax_id: initialData.tax_info?.tax_id || '',
          tax_id_type: initialData.tax_info?.tax_id_type || 'vat',
          tax_exempt: initialData.tax_info?.tax_exempt || false,
          tax_exempt_reason: initialData.tax_info?.tax_exempt_reason || ''
        },
        receipt_prefs: {
          email_receipts: initialData.receipt_prefs?.email_receipts ?? true,
          receipt_email: initialData.receipt_prefs?.receipt_email || '',
          auto_download: initialData.receipt_prefs?.auto_download || false,
          include_tax_breakdown: initialData.receipt_prefs?.include_tax_breakdown ?? true
        }
      });
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleTaxInfoChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      tax_info: {
        ...prev.tax_info,
        [field]: value
      }
    }));
  };

  const handleReceiptPrefsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      receipt_prefs: {
        ...prev.receipt_prefs,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !session) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/billing/update-billing-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update billing information');
      }

      const result = await response.json();
      setSuccess(true);
      
      if (onSave) {
        onSave(formData);
      }

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        if (onCancel) {
          onCancel();
        }
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update billing information');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-token-elevated rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto token-border-primary border">
        <div className="p-6 border-b token-border-primary">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold token-text-primary">
              Update Billing Information
            </h2>
            <button
              onClick={onCancel}
              className="token-text-tertiary hover:token-text-primary"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Success Message */}
          {success && (
            <div className="token-success-light border token-border-success rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="token-success text-xl">✅</div>
                <div>
                  <Text className="font-medium token-success-dark">
                    Billing information updated successfully!
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="token-error-light border token-border-error rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="token-error text-xl">⚠️</div>
                <div>
                  <Text className="font-medium token-error-dark">
                    {error}
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <Card className="p-6 bg-token-elevated token-border-primary border">
            <h3 className="text-lg font-medium token-text-primary mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium token-text-tertiary mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium token-text-tertiary mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium token-text-tertiary mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </Card>

          {/* Billing Address */}
          <Card className="p-6 bg-token-elevated token-border-primary border">
            <h3 className="text-lg font-medium token-text-primary mb-4">
              Billing Address
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium token-text-tertiary mb-2">
                  Address Line 1
                </label>
                <Input
                  type="text"
                  value={formData.address?.line1}
                  onChange={(e) => handleAddressChange('line1', e.target.value)}
                  placeholder="Street address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium token-text-tertiary mb-2">
                  Address Line 2
                </label>
                <Input
                  type="text"
                  value={formData.address?.line2}
                  onChange={(e) => handleAddressChange('line2', e.target.value)}
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium token-text-tertiary mb-2">
                    City
                  </label>
                  <Input
                    type="text"
                    value={formData.address?.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium token-text-tertiary mb-2">
                    State/Province
                  </label>
                  {formData.address?.country === 'US' ? (
                    <Select
                      value={formData.address?.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      required
                      className="token-accent-border"
                    >
                      <option value="">Select State</option>
                      {US_STATES.map(state => (
                        <option key={state.value} value={state.value}>
                          {state.label}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      type="text"
                      value={formData.address?.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      placeholder="State/Province"
                      required
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium token-text-tertiary mb-2">
                    Postal Code
                  </label>
                  <Input
                    type="text"
                    value={formData.address?.postal_code}
                    onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                    placeholder="Postal code"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium token-text-tertiary mb-2">
                  Country
                </label>
                <Select
                  value={formData.address?.country}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  required
                  className="token-accent-border"
                >
                  {COUNTRIES.map(country => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>

          {/* Tax Information */}
          <Card className="p-6 bg-token-elevated token-border-primary border">
            <h3 className="text-lg font-medium token-text-primary mb-4">
              Tax Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="tax_exempt"
                  checked={formData.tax_info?.tax_exempt}
                  onChange={(e) => handleTaxInfoChange('tax_exempt', e.target.checked)}
                  className="rounded token-border-primary token-accent focus:ring-token-accent"
                />
                <label htmlFor="tax_exempt" className="text-sm font-medium token-text-tertiary">
                  Tax Exempt Organization
                </label>
              </div>
              
              {formData.tax_info?.tax_exempt && (
                <div>
                  <label className="block text-sm font-medium token-text-tertiary mb-2">
                    Tax Exemption Reason
                  </label>
                  <Input
                    type="text"
                    value={formData.tax_info?.tax_exempt_reason}
                    onChange={(e) => handleTaxInfoChange('tax_exempt_reason', e.target.value)}
                    placeholder="Reason for tax exemption"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium token-text-tertiary mb-2">
                    Tax ID Type
                  </label>
                  <Select
                    value={formData.tax_info?.tax_id_type}
                    onChange={(e) => handleTaxInfoChange('tax_id_type', e.target.value)}
                    className="token-accent-border"
                  >
                    {TAX_ID_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium token-text-tertiary mb-2">
                    Tax ID Number
                  </label>
                  <Input
                    type="text"
                    value={formData.tax_info?.tax_id}
                    onChange={(e) => handleTaxInfoChange('tax_id', e.target.value)}
                    placeholder="Enter tax ID number"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Receipt Preferences */}
          <Card className="p-6 bg-token-elevated token-border-primary border">
            <h3 className="text-lg font-medium token-text-primary mb-4">
              Receipt Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="email_receipts"
                  checked={formData.receipt_prefs?.email_receipts}
                  onChange={(e) => handleReceiptPrefsChange('email_receipts', e.target.checked)}
                  className="rounded token-border-primary token-accent focus:ring-token-accent"
                />
                <label htmlFor="email_receipts" className="text-sm font-medium token-text-tertiary">
                  Email receipts automatically
                </label>
              </div>

              {formData.receipt_prefs?.email_receipts && (
                <div>
                  <label className="block text-sm font-medium token-text-tertiary mb-2">
                    Receipt Email Address
                  </label>
                  <Input
                    type="email"
                    value={formData.receipt_prefs?.receipt_email}
                    onChange={(e) => handleReceiptPrefsChange('receipt_email', e.target.value)}
                    placeholder="Email for receipts (leave blank to use primary email)"
                  />
                </div>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="auto_download"
                  checked={formData.receipt_prefs?.auto_download}
                  onChange={(e) => handleReceiptPrefsChange('auto_download', e.target.checked)}
                  className="rounded token-border-primary token-accent focus:ring-token-accent"
                />
                <label htmlFor="auto_download" className="text-sm font-medium token-text-tertiary">
                  Automatically download receipts
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="include_tax_breakdown"
                  checked={formData.receipt_prefs?.include_tax_breakdown}
                  onChange={(e) => handleReceiptPrefsChange('include_tax_breakdown', e.target.checked)}
                  className="rounded token-border-primary token-accent focus:ring-token-accent"
                />
                <label htmlFor="include_tax_breakdown" className="text-sm font-medium token-text-tertiary">
                  Include tax breakdown in receipts
                </label>
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t token-border-primary">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="token-accent-border token-accent hover:token-accent-light focus:ring-token-accent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="token-accent"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 