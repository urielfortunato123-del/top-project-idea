import { Company, Template } from '@/types/photo';

export const TEMPLATES: Template[] = [
  {
    id: 'civil-geral',
    name: 'Civil Geral',
    icon: '🏗️',
    description: 'Diário de obra para construção civil',
  },
  {
    id: 'pavimentacao',
    name: 'Pavimentação',
    icon: '🛣️',
    description: 'Obras de pavimentação e asfalto',
  },
  {
    id: 'drenagem',
    name: 'Drenagem',
    icon: '💧',
    description: 'Sistemas de drenagem e esgoto',
  },
  {
    id: 'terraplenagem',
    name: 'Terraplenagem',
    icon: '⛰️',
    description: 'Movimentação de terra',
  },
  {
    id: 'estruturas',
    name: 'Estruturas/Concreto',
    icon: '🏛️',
    description: 'Estruturas e concretagem',
  },
  {
    id: 'eletrica',
    name: 'Elétrica/Iluminação',
    icon: '💡',
    description: 'Instalações elétricas',
  },
  {
    id: 'sinalizacao',
    name: 'Sinalização',
    icon: '🚧',
    description: 'Sinalização viária e segurança',
  },
];

export const COMPANIES: Company[] = [
  {
    id: 'habittechene',
    name: 'HABITTECHENE',
    projects: [
      {
        id: 'rodovia-br101',
        name: 'Rodovia BR-101',
        companyId: 'habittechene',
        fronts: [
          { id: 'frente-a', name: 'Frente A - KM 50-60', projectId: 'rodovia-br101', templateId: 'pavimentacao' },
          { id: 'frente-b', name: 'Frente B - KM 60-70', projectId: 'rodovia-br101', templateId: 'pavimentacao' },
          { id: 'frente-c', name: 'Frente C - Drenagem', projectId: 'rodovia-br101', templateId: 'drenagem' },
        ],
      },
      {
        id: 'viaduto-central',
        name: 'Viaduto Central',
        companyId: 'habittechene',
        fronts: [
          { id: 'estrutura-1', name: 'Estrutura Pilar 1', projectId: 'viaduto-central', templateId: 'estruturas' },
          { id: 'estrutura-2', name: 'Estrutura Pilar 2', projectId: 'viaduto-central', templateId: 'estruturas' },
        ],
      },
    ],
  },
  {
    id: 'construtora-abc',
    name: 'Construtora ABC',
    projects: [
      {
        id: 'edificio-sul',
        name: 'Edifício Sul',
        companyId: 'construtora-abc',
        fronts: [
          { id: 'fundacao', name: 'Fundação', projectId: 'edificio-sul', templateId: 'estruturas' },
          { id: 'eletrica-geral', name: 'Elétrica Geral', projectId: 'edificio-sul', templateId: 'eletrica' },
        ],
      },
    ],
  },
];