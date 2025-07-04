// services/document.service.ts
import { 
  DocumentTemplate, 
  DocumentData, 
  DocumentItem, 
  DocumentCalculations,
  TaxConfiguration,
  CustomField 
} from '../types/document.type';

export class DocumentService {
  
  // Calculate item total with discount and tax
  static calculateItemTotal(item: DocumentItem): number {
    const baseTotal = item.quantity * item.unitPrice;
    const discountAmount = baseTotal * (item.discount || 0) / 100;
    const subtotalAfterDiscount = baseTotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * (item.taxRate || 0) / 100;
    return subtotalAfterDiscount + taxAmount;
  }

  // Calculate document totals
  static calculateDocumentTotals(items: DocumentItem[]): DocumentCalculations {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    const itemTotals: { [itemId: string]: number } = {};

    items.forEach(item => {
      const baseTotal = item.quantity * item.unitPrice;
      const discountAmount = baseTotal * (item.discount || 0) / 100;
      const subtotalAfterDiscount = baseTotal - discountAmount;
      const taxAmount = subtotalAfterDiscount * (item.taxRate || 0) / 100;
      
      subtotal += baseTotal;
      totalDiscount += discountAmount;
      totalTax += taxAmount;
      itemTotals[item.id] = subtotalAfterDiscount + taxAmount;
    });

    const grandTotal = subtotal - totalDiscount + totalTax;

    return {
      subtotal,
      totalDiscount,
      totalTax,
      grandTotal,
      itemTotals
    };
  }

  // Generate document number
  static generateDocumentNumber(type: 'devis' | 'invoice' | 'order_bond'): string {
    const prefix = {
      'devis': 'DEV',
      'invoice': 'FAC',
      'order_bond': 'BC'
    };
    
    const timestamp = Date.now().toString().slice(-6);
    const year = new Date().getFullYear().toString().slice(-2);
    
    return `${prefix[type]}-${year}${timestamp}`;
  }

  // Default tax configurations
  static getDefaultTaxConfigurations(): TaxConfiguration[] {
    return [
      { id: '1', name: 'TVA Standard (20%)', rate: 20, isDefault: true },
      { id: '2', name: 'TVA Réduite (10%)', rate: 10, isDefault: false },
      { id: '3', name: 'TVA Super Réduite (5.5%)', rate: 5.5, isDefault: false },
      { id: '4', name: 'TVA Particulière (2.1%)', rate: 2.1, isDefault: false },
      { id: '5', name: 'Exonéré de TVA (0%)', rate: 0, isDefault: false },
    ];
  }

  // Default custom fields for each document type
  static getDefaultCustomFields(type: 'devis' | 'invoice' | 'order_bond'): CustomField[] {
    const commonFields: CustomField[] = [
      {
        id: 'project_ref',
        name: 'Référence Projet',
        type: 'text',
        required: false
      },
      {
        id: 'payment_terms',
        name: 'Conditions de Paiement',
        type: 'select',
        required: false,
        options: ['Comptant', '30 jours', '45 jours', '60 jours', 'Sur réception']
      }
    ];

    switch (type) {
      case 'devis':
        return [
          ...commonFields,
          {
            id: 'validity_period',
            name: 'Validité du Devis',
            type: 'select',
            required: true,
            options: ['15 jours', '30 jours', '45 jours', '60 jours']
          },
          {
            id: 'delivery_time',
            name: 'Délai de Livraison',
            type: 'text',
            required: false
          }
        ];
      
      case 'invoice':
        return [
          ...commonFields,
          {
            id: 'order_reference',
            name: 'Référence Commande',
            type: 'text',
            required: false
          },
          {
            id: 'delivery_date',
            name: 'Date de Livraison',
            type: 'date',
            required: false
          }
        ];
      
      case 'order_bond':
        return [
          ...commonFields,
          {
            id: 'delivery_address',
            name: 'Adresse de Livraison',
            type: 'textarea',
            required: true
          },
          {
            id: 'urgency_level',
            name: 'Niveau d\'Urgence',
            type: 'select',
            required: false,
            options: ['Normal', 'Urgent', 'Très Urgent']
          }
        ];
      
      default:
        return commonFields;
    }
  }

  // Create default template
  static createDefaultTemplate(type: 'devis' | 'invoice' | 'order_bond'): DocumentTemplate {
    return {
      id: `default_${type}`,
      name: `Modèle ${type === 'devis' ? 'Devis' : type === 'invoice' ? 'Facture' : 'Bon de Commande'} Standard`,
      type,
      customFields: this.getDefaultCustomFields(type),
      defaultTaxRate: 20,
      availableTaxRates: this.getDefaultTaxConfigurations(),
      companyInfo: {
        name: 'Mantaeu.vert',
        address: '123 Rue de l\'Entreprise\n75001 Paris, France',
        phone: '+33 1 23 45 67 89',
        email: 'contact@mantaeuvert.com',
        website: 'www.mantaeuvert.com',
        siret: '123 456 789 00012',
        tvaNumber: 'FR12345678901'
      },
      terms: this.getDefaultTerms(type),
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Default terms for each document type
  static getDefaultTerms(type: 'devis' | 'invoice' | 'order_bond'): string {
    switch (type) {
      case 'devis':
        return `Conditions générales:
• Ce devis est valable pour la durée indiquée
• Les prix sont exprimés en euros TTC
• Tout travail supplémentaire fera l'objet d'un avenant
• L'acceptation de ce devis vaut bon de commande`;
      
      case 'invoice':
        return `Conditions de paiement:
• Paiement selon les conditions convenues
• Pénalités de retard: 3 fois le taux légal
• Escompte pour paiement anticipé: nous consulter
• En cas de retard de paiement, une indemnité forfaitaire de 40€ sera due`;
      
      case 'order_bond':
        return `Conditions de commande:
• Livraison à l'adresse indiquée
• Merci de confirmer la réception de cette commande
• Toute modification doit être validée par écrit
• Les délais de livraison sont donnés à titre indicatif`;
      
      default:
        return '';
    }
  }

  // Validate document data
  static validateDocument(document: Partial<DocumentData>, template: DocumentTemplate): string[] {
    const errors: string[] = [];

    // Basic validation
    if (!document.clientName?.trim()) {
      errors.push('Le nom du client est requis');
    }

    if (!document.items || document.items.length === 0) {
      errors.push('Au moins un article est requis');
    }

    // Validate items
    document.items?.forEach((item, index) => {
      if (!item.description?.trim()) {
        errors.push(`Description requise pour l'article ${index + 1}`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Quantité invalide pour l'article ${index + 1}`);
      }
      if (!item.unitPrice || item.unitPrice < 0) {
        errors.push(`Prix unitaire invalide pour l'article ${index + 1}`);
      }
    });

    // Validate required custom fields
    template.customFields.forEach(field => {
      if (field.required && !document.customFieldValues?.[field.id]?.trim()) {
        errors.push(`Le champ "${field.name}" est requis`);
      }
    });

    return errors;
  }

  // Format currency
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  // Format date
  static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }
}