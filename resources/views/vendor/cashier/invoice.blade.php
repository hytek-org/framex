<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $id ?? $invoice->number }}</title>
    <style>
        @page {
            margin: 50px;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1f2937;
            font-size: 11px;
            line-height: 1.5;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
        }
        .invoice-container {
            max-width: 800px;
            margin: auto;
        }
        
        /* Header style */
        .header-table {
            width: 100%;
            margin-bottom: 35px;
        }
        .logo-title {
            font-size: 24px;
            font-weight: 800;
            color: #111827;
            letter-spacing: -0.5px;
            line-height: 1;
        }
        .logo-sub {
            color: #9ca3af;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
            margin-top: 3px;
        }
        .invoice-header-col {
            text-align: right;
            vertical-align: top;
        }
        .invoice-header-title {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 10px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            border-radius: 9999px;
            letter-spacing: 0.5px;
        }
        .status-paid {
            background-color: #d1fae5;
            color: #065f46;
        }
        .status-unpaid {
            background-color: #fef3c7;
            color: #92400e;
        }

        /* Billing info layout */
        .info-table {
            width: 100%;
            margin-bottom: 35px;
        }
        .info-col-left {
            width: 50%;
            padding-right: 20px;
            vertical-align: top;
        }
        .info-col-right {
            width: 50%;
            padding-left: 20px;
            vertical-align: top;
        }
        .section-title {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            color: #9ca3af;
            letter-spacing: 1px;
            margin-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
        }
        .company-name {
            font-size: 13px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 3px;
        }
        .address-text {
            color: #4b5563;
            font-size: 11px;
            line-height: 1.45;
        }

        /* Invoice details metadata table */
        .invoice-details-table {
            width: 100%;
            border-collapse: collapse;
        }
        .invoice-details-table td {
            padding: 6px 0;
            border-bottom: 1px solid #f3f4f6;
            font-size: 11px;
        }
        .details-label {
            color: #6b7280;
            font-weight: 500;
            width: 110px;
        }
        .details-value {
            color: #111827;
            font-weight: 600;
            text-align: right;
        }

        /* Items Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            font-size: 9px;
            font-weight: 700;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
            text-align: left;
        }
        .items-table td {
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
            vertical-align: top;
        }
        .item-name {
            font-size: 12px;
            font-weight: 700;
            color: #111827;
        }
        .item-sub {
            font-size: 10px;
            color: #6b7280;
            margin-top: 2px;
        }
        .item-qty {
            color: #4b5563;
            font-size: 11px;
        }
        .item-price {
            color: #4b5563;
            font-size: 11px;
        }
        .item-amount {
            font-weight: 600;
            color: #111827;
            text-align: right;
            font-size: 11px;
        }

        /* Totals Calculations */
        .summary-container-table {
            width: 100%;
        }
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .summary-table td {
            padding: 6px 0;
            font-size: 11px;
            color: #4b5563;
        }
        .summary-label {
            text-align: left;
        }
        .summary-value {
            text-align: right;
            font-weight: 600;
            color: #111827;
        }
        .summary-row-total td {
            padding: 10px 0;
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
            font-weight: 700;
            color: #111827;
        }
        .total-value {
            font-size: 15px;
            color: #4f46e5;
        }

        /* Footer section */
        .footer {
            margin-top: 60px;
            border-top: 1px solid #f3f4f6;
            padding-top: 25px;
            text-align: center;
        }
        .footer-logo {
            font-size: 13px;
            font-weight: 800;
            color: #9ca3af;
            letter-spacing: -0.3px;
            margin-bottom: 5px;
        }
        .footer-note {
            font-size: 10px;
            color: #9ca3af;
            margin-bottom: 2px;
        }
        .footer-contact {
            font-size: 10px;
            font-weight: 500;
            color: #6b7280;
        }
    </style>
</head>
<body>

<div class="invoice-container">
    <!-- Top Header -->
    <table class="header-table" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td style="vertical-align: top;">
                <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="width: 4px; background-color: #4f46e5; border-radius: 2px;"></td>
                        <td style="width: 8px;"></td>
                        <td class="logo-title">FrameX</td>
                    </tr>
                </table>
                <div class="logo-sub">Enterprise Service</div>
            </td>
            <td class="invoice-header-col">
                <div class="invoice-header-title">Invoice</div>
                <span class="status-badge {{ $invoice->isPaid() ? 'status-paid' : 'status-unpaid' }}">
                    {{ $invoice->isPaid() ? 'Paid' : 'Unpaid' }}
                </span>
            </td>
        </tr>
    </table>

    <!-- Billing Info & Metadata -->
    <table class="info-table" border="0" cellpadding="0" cellspacing="0">
        <tr valign="top">
            <td class="info-col-left">
                <div class="section-title">Billing Details</div>
                
                <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                    <tr valign="top">
                        <td style="width: 50%; padding-right: 15px;">
                            <div style="font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px;">From</div>
                            <div class="company-name">{{ $vendor ?? $invoice->account_name }}</div>
                            <div class="address-text">
                                @isset($street) {{ $street }}<br> @endisset
                                @isset($location) {{ $location }}<br> @endisset
                                @isset($country) {{ $country }}<br> @endisset
                                @isset($email) {{ $email }}<br> @endisset
                                @isset($vendorVat) {{ $vendorVat }}<br>
                                @else
                                    @foreach ($invoice->accountTaxIds() as $taxId)
                                        {{ $taxId->value }}<br>
                                    @endforeach
                                @endisset
                            </div>
                        </td>
                        <td style="width: 50%; padding-left: 15px; border-left: 1px solid #e5e7eb;">
                            <div style="font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px;">To</div>
                            <div class="company-name">{{ $invoice->customer_name ?? $invoice->customer_email }}</div>
                            <div class="address-text">
                                @if ($address = $invoice->customer_address)
                                    @if ($address->line1) {{ $address->line1 }}<br> @endif
                                    @if ($address->line2) {{ $address->line2 }}<br> @endif
                                    @if ($address->city || $address->state || $address->postal_code)
                                        {{ implode(', ', array_filter([$address->city, $address->state, $address->postal_code])) }}<br>
                                    @endif
                                    @if ($address->country) {{ $address->country }}<br> @endif
                                @endif
                                @if ($invoice->customer_phone) {{ $invoice->customer_phone }}<br> @endif
                                @if ($invoice->customer_name) {{ $invoice->customer_email }}<br> @endif
                                @foreach ($invoice->customerTaxIds() as $taxId)
                                    {{ $taxId->value }}<br>
                                @endforeach
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
            
            <td style="width: 8%;"></td>
            
            <td class="info-col-right" style="width: 42%; padding-left: 0;">
                <div class="section-title">Invoice Info</div>
                <table class="invoice-details-table">
                    <tr>
                        <td class="details-label">Invoice Number</td>
                        <td class="details-value">{{ $id ?? $invoice->number }}</td>
                    </tr>
                    <tr>
                        <td class="details-label">Date Issued</td>
                        <td class="details-value">{{ $invoice->date()->toFormattedDateString() }}</td>
                    </tr>
                    <tr>
                        <td class="details-label">Due Date</td>
                        <td class="details-value">{{ $invoice->dueDate() ? $invoice->dueDate()->toFormattedDateString() : 'Upon Receipt' }}</td>
                    </tr>
                    <tr>
                        <td class="details-label">Payment Status</td>
                        <td class="details-value" style="color: {{ $invoice->isPaid() ? '#059669' : '#d97706' }}; text-transform: uppercase;">
                            {{ $invoice->isPaid() ? 'Fully Paid' : 'Pending' }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Line Items Table -->
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 50%;">Description</th>
                <th style="width: 10%;">Qty</th>
                <th style="width: 20%;">Unit Price</th>
                @if ($invoice->hasTax())
                    <th style="width: 10%; text-align: right;">Tax</th>
                @endif
                <th style="width: 10%; text-align: right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($invoice->invoiceLineItems() as $item)
                <tr>
                    <td>
                        <div class="item-name">{{ $item->description }}</div>
                        @if ($item->hasPeriod() && ! $item->periodStartAndEndAreEqual())
                            <div class="item-sub">{{ $item->startDate() }} - {{ $item->endDate() }}</div>
                        @endif
                    </td>
                    <td class="item-qty">{{ $item->quantity }}</td>
                    <td class="item-price">{{ $item->unitAmountExcludingTax() }}</td>
                    @if ($invoice->hasTax())
                        <td style="text-align: right; color: #6b7280; font-size: 11px;">
                            @if ($inclusiveTaxPercentage = $item->inclusiveTaxPercentage())
                                {{ $inclusiveTaxPercentage }}% incl.
                            @endif
                            @if ($item->hasBothInclusiveAndExclusiveTax())
                                +
                            @endif
                            @if ($exclusiveTaxPercentage = $item->exclusiveTaxPercentage())
                                {{ $exclusiveTaxPercentage }}%
                            @endif
                        </td>
                    @endif
                    <td class="item-amount">{{ $item->total() }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Calculations & Summary -->
    <table class="summary-container-table" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td style="width: 55%;"></td>
            <td style="width: 45%;">
                <table class="summary-table">
                    @if ($invoice->hasDiscount() || $invoice->hasTax() || $invoice->hasStartingBalance())
                        <tr>
                            <td class="summary-label">Subtotal</td>
                            <td class="summary-value">{{ $invoice->subtotal() }}</td>
                        </tr>
                    @endif

                    @if ($invoice->hasDiscount())
                        @foreach ($invoice->discounts() as $discount)
                            @php($coupon = $discount->coupon())
                            <tr>
                                <td class="summary-label">
                                    Discount: {{ $coupon->name() }} 
                                    @if ($coupon->isPercentage())
                                        ({{ $coupon->percentOff() }}% Off)
                                    @else
                                        ({{ $coupon->amountOff() }} Off)
                                    @endif
                                </td>
                                <td class="summary-value" style="color: #059669;">-{{ $invoice->discountFor($discount) }}</td>
                            </tr>
                        @endforeach
                    @endif

                    @unless ($invoice->isNotTaxExempt())
                        <tr>
                            <td class="summary-label" colspan="2">
                                @if ($invoice->isTaxExempt())
                                    Tax is exempted
                                @else
                                    Tax to be paid on reverse charge basis
                                @endif
                            </td>
                        </tr>
                    @else
                        @foreach ($invoice->taxes() as $tax)
                            <tr>
                                <td class="summary-label">
                                    {{ $tax->display_name }} 
                                    ({{ $tax->percentage }}%{{ $tax->isInclusive() ? ' incl.' : '' }})
                                </td>
                                <td class="summary-value">{{ $tax->amount() }}</td>
                            </tr>
                        @endforeach
                    @endunless

                    @if ($invoice->hasAppliedBalance())
                        <tr>
                            <td class="summary-label">Applied Balance</td>
                            <td class="summary-value">{{ $invoice->appliedBalance() }}</td>
                        </tr>
                    @endif

                    <tr class="summary-row-total">
                        <td class="summary-label">Total Amount Paid</td>
                        <td class="summary-value total-value">{{ $invoice->realTotal() }}</td>
                    </tr>

                    @if (!$invoice->isPaid() && $invoice->amountDue() !== '$0.00' && $invoice->amountDue() !== '0.00' && $invoice->amountDue() !== '$0' && $invoice->amountDue() !== '0')
                        <tr style="font-weight: 700; color: #b91c1c;">
                            <td class="summary-label" style="padding-top: 8px;">Amount Due</td>
                            <td class="summary-value" style="font-size: 13px; font-weight: 700; color: #b91c1c; padding-top: 8px;">{{ $invoice->amountDue() }}</td>
                        </tr>
                    @endif
                </table>
            </td>
        </tr>
    </table>

    <!-- Footer -->
    <div class="footer">
        <div class="footer-logo">FrameX</div>
        <div class="footer-note">Thank you for choosing FrameX. We appreciate your business.</div>
        <div class="footer-contact">Questions? Contact support@framex.io or visit help.framex.io</div>
    </div>
</div>

</body>
</html>
