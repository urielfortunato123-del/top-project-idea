import { useState } from 'react';
import { ExtractedEntity, useValidateEntity } from '@/hooks/useOCR';
import { ConfidenceBadge } from './ConfidenceBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, Pencil, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface EntityListProps {
  entities: ExtractedEntity[];
  editable?: boolean;
}

const entityTypeLabels: Record<string, string> = {
  obra: 'Obra',
  rodovia: 'Rodovia',
  km: 'KM',
  km_inicio: 'KM Início',
  km_fim: 'KM Fim',
  frente: 'Frente',
  atividade: 'Atividade',
  empresa: 'Empresa',
  fiscal: 'Fiscal',
  equipamentos: 'Equipamentos',
  data: 'Data',
  date: 'Data',
  local: 'Local',
  faixa: 'Faixa',
  espessura: 'Espessura',
  cbuq: 'CBUQ',
  temperatura: 'Temperatura',
  compactacao: 'Compactação',
  tipo_drenagem: 'Tipo Drenagem',
  diametro: 'Diâmetro',
  extensao: 'Extensão',
  cota: 'Cota',
  volume: 'Volume',
  tipo_material: 'Tipo Material',
  dmf: 'DMF',
  umidade: 'Umidade',
  area: 'Área',
  camada: 'Camada',
  fck: 'FCK',
  slump: 'Slump',
  elemento: 'Elemento',
  armadura: 'Armadura',
  forma: 'Forma',
  cura: 'Cura',
  nota_fiscal: 'Nota Fiscal',
  fornecedor: 'Fornecedor',
  poste: 'Poste',
  luminaria: 'Luminária',
  cabo: 'Cabo',
  transformador: 'Transformador',
  disjuntor: 'Disjuntor',
  circuito: 'Circuito',
  tensao: 'Tensão',
  potencia: 'Potência',
  tipo_placa: 'Tipo Placa',
  dimensao: 'Dimensão',
  lado: 'Lado',
  altura: 'Altura',
  tachas: 'Tachas',
  defensas: 'Defensas',
  pintura: 'Pintura',
  cnpj: 'CNPJ',
  cpf: 'CPF',
  placa: 'Placa',
};

export function EntityList({ entities, editable = false }: EntityListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const validateEntity = useValidateEntity();
  const { toast } = useToast();

  const handleEdit = (entity: ExtractedEntity) => {
    setEditingId(entity.id);
    setEditValue(entity.validated_value || entity.entity_value);
  };

  const handleSave = async (entity: ExtractedEntity) => {
    try {
      await validateEntity.mutateAsync({
        entityId: entity.id,
        validatedValue: editValue,
      });
      setEditingId(null);
      toast({
        title: 'Entidade validada',
        description: 'O valor foi atualizado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao validar',
        description: 'Não foi possível salvar a alteração.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleAcceptSuggestion = async (entity: ExtractedEntity) => {
    if (!entity.ai_suggestion) return;
    try {
      await validateEntity.mutateAsync({
        entityId: entity.id,
        validatedValue: entity.ai_suggestion,
      });
      toast({
        title: 'Sugestão aceita',
        description: 'O valor foi atualizado com a sugestão da IA.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível aplicar a sugestão.',
        variant: 'destructive',
      });
    }
  };

  if (entities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhuma entidade extraída</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entities.map((entity) => (
        <div
          key={entity.id}
          className={cn(
            'p-3 rounded-lg border bg-card',
            entity.is_validated && 'border-green-500/30 bg-green-500/5'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {entityTypeLabels[entity.entity_type] || entity.entity_type}
                </span>
                <ConfidenceBadge 
                  level={entity.confidence_level as 'green' | 'yellow' | 'red'} 
                  score={entity.confidence_score}
                  size="sm"
                />
                {entity.is_validated && (
                  <span className="text-xs text-green-500 flex items-center gap-0.5">
                    <Check className="h-3 w-3" />
                    Validado
                  </span>
                )}
              </div>

              {editingId === entity.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-green-500"
                    onClick={() => handleSave(entity)}
                    disabled={validateEntity.isPending}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500"
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-sm font-medium truncate">
                  {entity.validated_value || entity.entity_value}
                </p>
              )}

              {entity.ai_suggestion && !entity.is_validated && editingId !== entity.id && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-muted-foreground">Sugestão IA:</span>
                  <span className="text-primary">{entity.ai_suggestion}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleAcceptSuggestion(entity)}
                  >
                    Aceitar
                  </Button>
                </div>
              )}
            </div>

            {editable && editingId !== entity.id && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => handleEdit(entity)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
