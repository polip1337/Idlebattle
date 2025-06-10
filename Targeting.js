import { getFormation } from './battle_controller.js';

export function selectTarget(attacker, targetMode, condition = null) {
    let target = [];
    const formation = getFormation();

    switch (targetMode) {
        case 'Random':
            target.push(attacker.opposingTeam.getRandomAliveMember());
            break;
        case 'Random Front':
            if (attacker.opposingTeam.getRandomFrontMember() != undefined) {
                target.push(attacker.opposingTeam.getRandomFrontMember());
            } else if (attacker.opposingTeam.getRandomBackMember() != undefined && target.length == 0) {
                target.push(attacker.opposingTeam.getRandomBackMember());
            }
            break;
        case 'Random Back':
            if (attacker.opposingTeam.getRandomBackMember() != undefined) {
                target.push(attacker.opposingTeam.getRandomBackMember());
            } else if (attacker.opposingTeam.getRandomFrontMember() != undefined && target.length == 0) {
                target.push(attacker.opposingTeam.getRandomFrontMember());
            }
            break;
        case 'Random Any':
            target.push(attacker.opposingTeam.getRandomAliveMember());
            break;
        case 'Random Ally Front':
            target.push(attacker.team.getRandomFrontMember());
            break;
        case 'Random Ally Back':
            target.push(attacker.team.getRandomBackMember());
            break;
        case 'Random Ally':
            target.push(attacker.team.getRandomAliveMember());
            break;
        case 'Self':
            target.push(attacker);
            break;
        case 'Specific Enemy Front X':
            target.push(attacker.opposingTeam.getFrontMember(X));
            break;
        case 'Specific Enemy Back X':
            target.push(attacker.opposingTeam.getBackMember(X));
            break;
        case 'Specific Ally Front X':
            target.push(attacker.team.getFrontMember(X));
            break;
        case 'Specific Ally Back X':
            target.push(attacker.team.getBackMember(X));
            break;
        case 'All Front':
            target = attacker.opposingTeam.getAllFrontMembers();
            break;
        case 'All Back':
            target = attacker.opposingTeam.getAllBackMembers();
            break;
        case 'All Enemies':
            target = attacker.opposingTeam.getAllAliveMembers();
            break;
        case 'All Team Front':
            target = attacker.team.getAllFrontMembers();
            break;
        case 'All Team Back':
            target = attacker.team.getAllBackMembers();
            break;
        case 'All Ally':
            target = attacker.team.getAllAliveMembers();
            break;
        case 'Row Front':
            target = attacker.opposingTeam.getRowFrontMembers(attacker);
            break;
        case 'Row Back':
            target = attacker.opposingTeam.getRowBackMembers(attacker);
            break;
        case 'All Characters':
            if (formation) {
                target = formation.getAllCharacters();
            } else {
                // Fallback to combining team members if formation not available
                target = [...attacker.team.getAllAliveMembers(), ...attacker.opposingTeam.getAllAliveMembers()];
            }
            break;
        case 'Lowest HP Front':
            target.push(attacker.opposingTeam.getLowestHPFrontMember());
            break;
        case 'Lowest HP Back':
            target.push(attacker.opposingTeam.getLowestHPBackMember());
            break;
        case 'Lowest HP':
            target.push(attacker.opposingTeam.getLowestHPMember());
            break;
        case 'Highest HP Front':
            target.push(attacker.opposingTeam.getHighestHPFrontMember());
            break;
        case 'Highest HP Back':
            target.push(attacker.opposingTeam.getHighestHPBackMember());
            break;
        case 'Highest HP Any':
            target.push(attacker.opposingTeam.getHighestHPMember());
            break;
        case 'Lowest HP Team Front':
            target.push(attacker.team.getLowestHPFrontMember());
            break;
        case 'Lowest HP Team Back':
            target.push(attacker.team.getLowestHPBackMember());
            break;
        case 'Lowest HP Team Any':
            target.push(attacker.team.getLowestHPMember());
            break;
        case 'Highest HP Team Front':
            target.push(attacker.team.getHighestHPFrontMember());
            break;
        case 'Highest HP Team Back':
            target.push(attacker.team.getHighestHPBackMember());
            break;
        case 'Highest HP Team Any':
            target.push(attacker.team.getHighestHPMember());
            break;
        case 'Column 1':
            if (formation) {
                target = formation.getColumnMembers(0);
            }
            break;
        case 'Column 2':
            if (formation) {
                target = formation.getColumnMembers(1);
            }
            break;
        case 'Column 3':
            if (formation) {
                target = formation.getColumnMembers(2);
            }
            break;
        case 'Column 4':
            if (formation) {
                target = formation.getColumnMembers(3);
            }
            break;
        case 'Adjacent Enemies':
            if (formation) {
                const adjacent = formation.getAdjacentCharacters(attacker);
                target = adjacent.filter(char => char.team === attacker.opposingTeam);
            }
            break;
        case 'Adjacent Allies':
            if (formation) {
                const adjacent = formation.getAdjacentCharacters(attacker);
                target = adjacent.filter(char => char.team === attacker.team);
            }
            break;
        case 'Diagonal from Caster':
            if (formation) {
                target = formation.getDiagonalCharacters(attacker);
            }
            break;
        case 'Diagonal from Target':
            break;
        case 'Self AoE':
            if (formation) {
                target = formation.getAdjacentCharacters(attacker);
            } else {
                console.warn('Formation not available for Self AoE targeting');
            }
            break;
        case 'Allies With Condition':
            if (typeof condition === 'function') {
                target = attacker.team.getAllAliveMembers().filter(condition);
            } else {
                console.warn('No condition function provided for Allies With Condition targeting');
            }
            break;
        default:
            console.error(`Invalid target mode: ${targetMode}`);
            break;
    }
    if (target === undefined) {
        console.error(`Invalid target mode: ${targetMode}`);
    }
    return target;
}