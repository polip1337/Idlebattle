export function selectTarget(attacker, targetMode) {
    let target = [];

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
            target = attacker.battlefield.getRowFrontMembers(attacker);
            break;
        case 'Row Back':
            target = attacker.battlefield.getRowBackMembers(attacker);
            break;
        case 'All Characters':
            target = attacker.battlefield.getAllCharacters();
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
            target = attacker.battlefield.getColumnMembers(1);
            break;
        case 'Column 2':
            target = attacker.battlefield.getColumnMembers(2);
            break;
        case 'Column 3':
            target = attacker.battlefield.getColumnMembers(3);
            break;
        case 'Column 4':
            target = attacker.battlefield.getColumnMembers(4);
            break;
        case 'Adjacent Enemies':
            target = attacker.opposingTeam.getAdjacentMembers(attacker);
            break;
        case 'Adjacent Allies':
            target = attacker.team.getAdjacentMembers(attacker);
            break;
        case 'Diagonal from Caster':
            target = attacker.battlefield.getDiagonalMembers(attacker);
            break;
        case 'Diagonal from Target':
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