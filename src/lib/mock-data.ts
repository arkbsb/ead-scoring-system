import { Lead } from './types';
import { calculateScore, getSegmentation } from './scoring';

const firstNames = ['Ana', 'Maria', 'Juliana', 'Patricia', 'Fernanda', 'Camila', 'Bruna', 'Larissa', 'Mariana', 'Beatriz'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes'];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateMockLeads = (count: number): Lead[] => {
    const leads: Lead[] = [];

    for (let i = 0; i < count; i++) {
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        const name = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`;
        const whatsapp = `(11) 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`;
        const utm_source = getRandomElement(['instagram', 'facebook', 'google', 'email', 'organic']);

        const lead: Partial<Lead> = {
            id: `lead-${i + 1}`,
            name: name,
            email: email,
            whatsapp: whatsapp,
            utm_source: utm_source,
            timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            age: getRandomElement(['Menor de 18 anos', '18 a 32 anos', '33 a 42 anos', '43 a 52 anos', '53 a 62 anos', '63 a 72 anos', '73 ou mais']),
            hasChildren: getRandomElement(['Sim', 'Não']),
            gender: getRandomElement(['Feminino', 'Masculino']),
            education: getRandomElement(['Ensino Fundamental', 'Ensino Médio', 'Graduação Incompleta', 'Graduação Completa', 'Pós-Graduação/MBA', 'Mestrado', 'Doutorado', 'Sem instrução']),
            maritalStatus: getRandomElement(['Solteira', 'União Estável', 'Casada', 'Divorciada', 'Viúva']),
            followTime: getRandomElement(['Te conheci recentemente', 'Te conheço há mais de 3 meses', 'Te conheço há mais de 1 ano', 'Te conheço há mais de 2 anos']),
            hasStore: getRandomElement(['Sim', 'Não']),
            storeType: getRandomElement(['Física', 'Online', 'Física e Online', 'Não tenho loja ainda']),
            segment: getRandomElement(['Loja Feminina', 'Moda Feminina', 'Infantil', 'Acessórios', 'Outros']),
            difficulty: getRandomElement(['Gestão', 'Vendas', 'Marketing', 'Financeiro']),
            revenue: getRandomElement(['Ainda não faturo / Estou começando', 'Até R$ 15 mil/mês', 'De R$ 15 mil a R$ 50 mil/mês', 'De R$ 50 mil a R$ 100 mil/mês', 'Acima de R$ 100 mil/mês']),
            storeTime: getRandomElement(['Ainda não tenho loja', 'Menos de 6 meses', 'De 6 meses a 1 ano', 'De 1 a 3 anos', 'Acima de 3 anos']),
            management: getRandomElement(['Trabalho totalmente no improviso', 'Tenho certa organização, mas não consistente', 'Uso planilhas simples para me organizar', 'Tenho sistema, mas uso pouco', 'Tenho sistema, processos e controle organizado']),
            digitalPresence: getRandomElement(['Não vendo online e nem uso as redes sociais', 'Tenho redes sociais, mas só posto às vezes e tenho vergonha de aparecer', 'Tenho perfil ativo, mas não consigo vender online', 'Vendo com frequência via Instagram e WhatsApp', 'Tenho loja online estruturada (site, plataforma e etc) e vendo bem']),
            teamStructure: getRandomElement(['Faço tudo sozinha, da venda ao atendimento, sem ajuda', 'Tenho alguém que me ajuda, mas é informal (parente, amigo, etc)', 'Tenho de 1 a 3 pessoas na equipe, mas sem muita organização', 'Tenho uma equipe pequena, mas com funções mais claras', 'Tenho uma equipe bem estruturada, com processos definidos']),
            sales: getRandomElement(['Vendo muito pouco ou quase nada', 'Vendo, mas é muito inconstante, nunca sei quanto vou faturar', 'Vendo bem, mas acredito que posso vender mais', 'Vendo bem e de forma constante']),
            dream: 'Ter liberdade financeira',
            isStudent: getRandomElement(['Sim', 'Não']),
            challengeDifficulty: 'Escalar vendas',
            question: 'Como faço para começar?'
        };

        const score = calculateScore(lead);
        leads.push({
            ...lead,
            score,
            segmentation: getSegmentation(score)
        } as Lead);
    }

    return leads;
};
