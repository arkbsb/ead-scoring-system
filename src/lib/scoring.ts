import { Lead } from './types';

export const calculateScore = (lead: Partial<Lead>): number => {
    let score = 0;

    // 1. Idade
    const age = lead.age || '';
    if (age.includes('Menor de 18')) score += 2;
    else if (age.includes('18 a 32')) score += 5;
    else if (age.includes('33 a 42')) score += 25;
    else if (age.includes('43 a 52')) score += 45;
    else if (age.includes('53 a 62')) score += 10;
    else if (age.includes('63 a 72')) score += 8;
    else if (age.includes('73 ou mais')) score += 5;

    // 2. Tem filhos
    if (lead.hasChildren === 'Sim') score += 80;
    else if (lead.hasChildren === 'Não') score += 20;

    // 3. Gênero
    if (lead.gender === 'Feminino') score += 94;
    else if (lead.gender === 'Masculino') score += 6;

    // 4. Escolaridade
    const edu = lead.education || '';
    if (edu.includes('Fundamental')) score += 1;
    else if (edu.includes('Médio')) score += 19;
    else if (edu.includes('Graduação Incompleta')) score += 4;
    else if (edu.includes('Graduação Completa')) score += 48;
    else if (edu.includes('Pós-Graduação') || edu.includes('MBA')) score += 25;
    else if (edu.includes('Mestrado')) score += 1;
    else if (edu.includes('Doutorado')) score += 1;
    else if (edu.includes('Sem instrução')) score += 1;

    // 5. Estado Civil
    const civil = lead.maritalStatus || '';
    if (civil.includes('Solteira')) score += 13;
    else if (civil.includes('União Estável')) score += 9;
    else if (civil.includes('Casada')) score += 68;
    else if (civil.includes('Divorciada')) score += 7;
    else if (civil.includes('Viúva')) score += 3;

    // 6. Tempo que acompanha
    const follow = lead.followTime || '';
    if (follow.includes('recentemente')) score += 60;
    else if (follow.includes('3 meses')) score += 20;
    else if (follow.includes('1 ano')) score += 11;
    else if (follow.includes('2 anos')) score += 9;

    // 7. Já tem loja
    if (lead.hasStore === 'Sim') score += 95;
    else if (lead.hasStore === 'Não') score += 5;

    // 8. Tipo de loja
    const type = lead.storeType || '';
    if (type.includes('Física e Online')) score += 40;
    else if (type.includes('Física')) score += 40;
    else if (type.includes('Online')) score += 20;
    else if (type.includes('Não tenho')) score += 5;

    // 9. Segmento (texto livre)
    const segment = (lead.segment || '').toLowerCase();
    if (segment.includes('loja feminina') || segment.includes('moda feminina')) score += 100;

    // 10. Maior dificuldade (texto livre)
    const diff = (lead.difficulty || '').toLowerCase();
    if (diff.includes('gestão') || diff.includes('vendas')) score += 100;

    // 11. Faturamento mensal
    const rev = lead.revenue || '';
    if (rev.includes('Ainda não') || rev.includes('Estou começando')) score += 10;
    else if (rev.includes('Até R$ 15 mil')) score += 25;
    else if (rev.includes('15 mil a R$ 50 mil')) score += 25;
    else if (rev.includes('50 mil a R$ 100 mil')) score += 25;
    else if (rev.includes('Acima de R$ 100 mil')) score += 15;

    // 12. Tempo de loja
    const time = lead.storeTime || '';
    if (time.includes('Ainda não')) score += 10;
    else if (time.includes('Menos de 6 meses')) score += 15;
    else if (time.includes('6 meses a 1 ano')) score += 20;
    else if (time.includes('1 a 3 anos')) score += 30;
    else if (time.includes('Acima de 3 anos')) score += 25;

    // 13. Gestão e organização
    const mgmt = lead.management || '';
    if (mgmt.includes('improviso')) score += 10;
    else if (mgmt.includes('não consistente')) score += 25;
    else if (mgmt.includes('planilhas simples')) score += 25;
    else if (mgmt.includes('uso pouco')) score += 25;
    else if (mgmt.includes('controle organizado')) score += 15;

    // 14. Presença digital
    const digital = lead.digitalPresence || '';
    if (digital.includes('Não vendo online')) score += 10;
    else if (digital.includes('vergonha')) score += 30;
    else if (digital.includes('não consigo vender')) score += 30;
    else if (digital.includes('Vendo com frequência')) score += 15;
    else if (digital.includes('loja online estruturada')) score += 15;

    // 15. Estrutura de equipe
    const team = lead.teamStructure || '';
    if (team.includes('sozinha')) score += 25;
    else if (team.includes('informal')) score += 25;
    else if (team.includes('1 a 3 pessoas')) score += 30;
    else if (team.includes('equipe pequena')) score += 10;
    else if (team.includes('bem estruturada')) score += 10;

    // 16. Vendas
    const sales = lead.sales || '';
    if (sales.includes('muito pouco')) score += 20;
    else if (sales.includes('inconstante')) score += 30;
    else if (sales.includes('posso vender mais')) score += 30;
    else if (sales.includes('constante')) score += 20;

    // 18. Já é aluna
    if (lead.isStudent === 'Sim') score += 5;
    else if (lead.isStudent === 'Não') score += 95;

    return score;
};

export const getSegmentation = (score: number): 'Quente' | 'Morno' | 'Frio' => {
    if (score > 700) return 'Quente';
    if (score >= 400) return 'Morno';
    return 'Frio';
};
