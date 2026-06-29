import { formatPrice, formatDate } from '@/lib/format'

export function WarrantyCertificate({ warranty }) {
  const sale = warranty.sale
  const customer = sale.customer
  const items = sale.items || []
  const taxRate = parseFloat(sale.tax_rate ?? 0)
  const hasTax = taxRate > 0 && parseFloat(sale.tax) > 0

  return (
    <div
      id="warranty-printable"
      className="warranty-cert bg-white text-zinc-900 rounded-2xl shadow-2xl"
      style={{
        fontFamily: "'Sora', sans-serif",
        padding: '40px 50px',
        fontSize: '11px',
        color: '#1A1A1A',
        lineHeight: 1.5,
      }}
    >
      {/* ===== EN-TÊTE ===== */}
      <header style={{ borderBottom: '2px solid #1A1A1A', paddingBottom: '20px', marginBottom: '24px' }}>
        <h1 style={{ color: '#F39200', fontSize: '28px', margin: '0 0 5px 0', fontWeight: 700, lineHeight: 1 }}>
          <span style={{ fontStyle: 'italic' }}>Shadi</span>
          <span style={{ color: '#1A1A1A', marginLeft: '4px' }}>PHONE</span>
        </h1>
        <div style={{ fontSize: '10px', color: '#555' }}>
          @SHADI_PHONE · BOUTIQUE OFFICIELLE
        </div>
        <div style={{ marginTop: '8px', fontSize: '10px', color: '#666', fontFamily: "'JetBrains Mono', monospace" }}>
          <div style={{ fontSize: '13px', color: '#000', fontWeight: 700 }}>
            N° {warranty.warranty_number}
          </div>
          <div>Émis le {formatDate(warranty.issued_at)}</div>
          <div>Vente N° {sale.reference}</div>
        </div>
      </header>

      {/* ===== TITRE ===== */}
      <h2
        style={{
          color: '#1A1A1A',
          fontSize: '22px',
          margin: '30px 0 5px 0',
          textAlign: 'center',
          fontWeight: 700,
        }}
      >
        BON DE GARANTIE
      </h2>
      <div
        style={{
          textAlign: 'center',
          fontSize: '10px',
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          marginBottom: '30px',
        }}
      >
        Certificat officiel · {warranty.duration_months} mois
      </div>

      {/* ===== INFOS CLIENT ===== */}
      <InfoBlock title="Informations client">
        <InfoRow k="Nom" v={customer.name} />
        <InfoRow k="Téléphone" v={customer.phone || '—'} />
        <InfoRow k="Email" v={customer.email || '—'} />
      </InfoBlock>

      {/* ===== VALIDITÉ ===== */}
      <InfoBlock title="Validité de garantie">
        <InfoRow k="Date d'achat" v={formatDate(warranty.issued_at)} />
        <InfoRow k="Fin de garantie" v={formatDate(warranty.expires_at)} />
        <InfoRow k="Durée" v={`${warranty.duration_months} mois (constructeur)`} />
      </InfoBlock>

      {/* ===== TABLEAU PRODUITS ===== */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          margin: '20px 0',
        }}
      >
        <thead>
          <tr>
            <th style={tableHeaderStyle('40%', 'left')}>Modèle</th>
            <th style={tableHeaderStyle('30%', 'left')}>IMEI</th>
            <th style={tableHeaderStyle('10%', 'left')}>Qté</th>
            <th style={tableHeaderStyle('20%', 'right')}>Prix</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td style={tableCellStyle()}>
                <strong>{item.product_name}</strong>
                <br />
                <span style={{ color: '#888', fontSize: '10px' }}>{item.product_storage}</span>
              </td>
              <td style={{ ...tableCellStyle(), fontFamily: "'JetBrains Mono', monospace" }}>
                {item.imei}
              </td>
              <td style={tableCellStyle()}>{item.quantity}×</td>
              <td style={{ ...tableCellStyle(), textAlign: 'right', fontWeight: 'bold' }}>
                {formatPrice(parseFloat(item.line_total))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== TOTAUX ===== */}
      {hasTax ? (
        <>
          <div style={subtotalRowStyle}>
            Sous-total HT : <strong>{formatPrice(parseFloat(sale.subtotal))}</strong>
          </div>
          <div style={subtotalRowStyle}>
            TVA ({taxRate.toFixed(2).replace('.', ',')}%) :{' '}
            <strong>{formatPrice(parseFloat(sale.tax))}</strong>
          </div>
          <div style={totalLineStyle}>
            TOTAL TTC :{' '}
            <span style={totalAmountStyle}>{formatPrice(parseFloat(sale.total))}</span>
          </div>
        </>
      ) : (
        <div style={totalLineStyle}>
          TOTAL (HT - sans TVA) :{' '}
          <span style={totalAmountStyle}>{formatPrice(parseFloat(sale.total))}</span>
        </div>
      )}


      {/* ===== SIGNATURES ===== */}
      <div style={{ marginTop: '40px', fontSize: '10px' }}>
        <div style={signatureStyle}>Signature client</div>
        <div style={signatureStyle}>Cachet & signature vendeur</div>
      </div>
    </div>
  )
}

/* ========== Sous-composants ========== */

function InfoBlock({ title, children }) {
  return (
    <div
      style={{
        background: '#F6F8FB',
        padding: '14px',
        marginBottom: '12px',
        borderRadius: '4px',
      }}
    >
      <strong
        style={{
          color: '#F39200',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          display: 'block',
          marginBottom: '8px',
        }}
      >
        {title}
      </strong>
      {children}
    </div>
  )
}

function InfoRow({ k, v }) {
  return (
    <div style={{ padding: '4px 0', fontSize: '11px' }}>
      <span style={{ color: '#777', display: 'inline-block', width: '130px' }}>{k} :</span>
      <span style={{ color: '#1A1A1A', fontWeight: 500 }}>{v}</span>
    </div>
  )
}

/* ========== Styles inline réutilisables ========== */

const tableHeaderStyle = (width, align = 'left') => ({
  background: '#1A1A1A',
  color: 'white',
  padding: '10px',
  textAlign: align,
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  width,
})

const tableCellStyle = () => ({
  padding: '10px',
  borderBottom: '1px solid #E5EAF1',
  fontSize: '11px',
  color: '#1A1A1A',
})

const subtotalRowStyle = {
  textAlign: 'right',
  padding: '8px 12px',
  fontSize: '11px',
  background: 'white',
}

const totalLineStyle = {
  background: '#1A1A1A',
  color: 'white',
  padding: '12px',
  textAlign: 'right',
  fontWeight: 'bold',
  borderRadius: '0 0 4px 4px',
  marginTop: 0,
}

const totalAmountStyle = {
  color: '#FFA940',
  fontSize: '14px',
  fontFamily: "'JetBrains Mono', monospace",
  marginLeft: '8px',
}

const signatureStyle = {
  display: 'inline-block',
  width: '45%',
  marginRight: '4%',
  textAlign: 'center',
  borderTop: '1.5px solid #1A1A1A',
  paddingTop: '8px',
  color: '#888',
  textTransform: 'uppercase',
  letterSpacing: '1px',
}