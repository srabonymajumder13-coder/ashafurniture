// ══════════════════════════════════════════════════════════════════
// ASHA FURNITURE — Google Sheets Order Integration
// ══════════════════════════════════════════════════════════════════
//
// SETUP INSTRUCTIONS:
//
// STEP 1: Create a new Google Sheet
//   - Go to sheets.google.com → New spreadsheet
//   - Name it "Asha Furniture Orders"
//   - Add these headers in Row 1:
//     Order No | Date & Time | Customer Name | Phone | Email |
//     Address | City | District | Notes | Items | Item Count |
//     Subtotal (৳) | Total (৳) | Payment Method | Status
//
// STEP 2: Open Apps Script
//   - In Google Sheets: Extensions → Apps Script
//   - Delete any existing code
//   - Paste the entire code below
//
// STEP 3: Deploy as Web App
//   - Click "Deploy" → "New deployment"
//   - Type: Web app
//   - Execute as: Me
//   - Who has access: Anyone
//   - Click "Deploy" → copy the Web App URL
//
// STEP 4: Update the website
//   - Open index.html
//   - Find:  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
//   - Replace with your copied URL
//
// ══════════════════════════════════════════════════════════════════

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Order No', 'Date & Time', 'Customer Name', 'Phone', 'Email',
        'Address', 'City', 'District', 'Notes', 'Items', 'Item Count',
        'Subtotal (৳)', 'Total (৳)', 'Payment Method', 'Status'
      ]);
      
      // Style headers
      var headerRange = sheet.getRange(1, 1, 1, 15);
      headerRange.setBackground('#2C1A0E');
      headerRange.setFontColor('#F5EDE4');
      headerRange.setFontWeight('bold');
      headerRange.setFontSize(11);
      sheet.setFrozenRows(1);
      
      // Set column widths
      sheet.setColumnWidth(1, 120);  // Order No
      sheet.setColumnWidth(2, 160);  // Date
      sheet.setColumnWidth(3, 160);  // Name
      sheet.setColumnWidth(4, 140);  // Phone
      sheet.setColumnWidth(5, 180);  // Email
      sheet.setColumnWidth(6, 220);  // Address
      sheet.setColumnWidth(7, 100);  // City
      sheet.setColumnWidth(8, 120);  // District
      sheet.setColumnWidth(9, 200);  // Notes
      sheet.setColumnWidth(10, 300); // Items
      sheet.setColumnWidth(11, 90);  // Count
      sheet.setColumnWidth(12, 110); // Subtotal
      sheet.setColumnWidth(13, 100); // Total
      sheet.setColumnWidth(14, 130); // Payment
      sheet.setColumnWidth(15, 100); // Status
    }
    
    // Append order row
    sheet.appendRow([
      data.orderNumber,
      data.timestamp,
      data.customerName,
      data.phone,
      data.email || '',
      data.address,
      data.city,
      data.district || '',
      data.notes || '',
      data.items,
      data.itemCount,
      data.subtotal,
      data.total,
      data.paymentMethod,
      data.status || 'Pending'
    ]);
    
    // Color the new row
    var lastRow = sheet.getLastRow();
    var rowRange = sheet.getRange(lastRow, 1, 1, 15);
    rowRange.setBackground(lastRow % 2 === 0 ? '#FDF8F3' : '#FFFFFF');
    
    // Color status cell
    var statusCell = sheet.getRange(lastRow, 15);
    statusCell.setBackground('#FFF3CD');
    statusCell.setFontColor('#856404');
    
    // Send notification email (optional — fill in your email)
    var NOTIFY_EMAIL = 'info@ashafurniture.com.bd'; // Change this!
    try {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: '🛒 New Order: ' + data.orderNumber + ' — ' + data.customerName,
        htmlBody: `
          <div style="font-family:Arial,sans-serif;max-width:600px;">
            <div style="background:#2C1A0E;padding:20px;text-align:center;">
              <h1 style="color:#C8922A;margin:0;letter-spacing:3px;">ASHA FURNITURE</h1>
              <p style="color:#C4956A;margin:4px 0 0;font-size:12px;">New Order Received</p>
            </div>
            <div style="padding:24px;background:#FDF8F3;border:1px solid #E8D8B8;">
              <h2 style="color:#2C1A0E;">Order ${data.orderNumber}</h2>
              <p style="color:#5C3D22;"><strong>Date:</strong> ${data.timestamp}</p>
              <hr style="border-color:#E8D8B8;">
              <h3 style="color:#2C1A0E;">Customer Details</h3>
              <p><strong>Name:</strong> ${data.customerName}</p>
              <p><strong>Phone:</strong> ${data.phone}</p>
              <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
              <p><strong>Address:</strong> ${data.address}, ${data.city}, ${data.district}</p>
              ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
              <hr style="border-color:#E8D8B8;">
              <h3 style="color:#2C1A0E;">Order Items</h3>
              <p>${data.items}</p>
              <p><strong>Item Count:</strong> ${data.itemCount}</p>
              <hr style="border-color:#E8D8B8;">
              <h3 style="color:#2C1A0E;">Payment</h3>
              <p><strong>Method:</strong> ${data.paymentMethod}</p>
              <p style="font-size:20px;color:#2C1A0E;"><strong>Total: ৳ ${Number(data.total).toLocaleString()}</strong></p>
            </div>
            <div style="background:#2C1A0E;padding:16px;text-align:center;">
              <a href="https://docs.google.com/spreadsheets" style="color:#C8922A;font-size:13px;">View in Google Sheets →</a>
            </div>
          </div>`
      });
    } catch(mailErr) {
      // Email sending failed — order still saved
      console.log('Mail error:', mailErr);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, order: data.orderNumber}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function — run this in Apps Script to verify the sheet works
function testOrder() {
  var testData = {
    postData: {
      contents: JSON.stringify({
        orderNumber: 'AF-TEST01',
        timestamp: new Date().toLocaleString(),
        customerName: 'Test Customer',
        phone: '01700-000000',
        email: 'test@test.com',
        address: '12 Test Road, Gulshan',
        city: 'Dhaka',
        district: 'Dhaka',
        notes: 'This is a test order',
        items: 'Horizon Sofa ×1, Walnut Platform Bed ×2',
        itemCount: 3,
        subtotal: 218000,
        total: 218000,
        paymentMethod: 'COD',
        status: 'Pending'
      })
    }
  };
  doPost(testData);
}
