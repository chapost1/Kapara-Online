import { trigger, style, animate, transition, state, keyframes } from '@angular/animations';

export const quantityLowAnimation = [
    trigger('quantityLowAnimation', [
        state('invalid', style({})),
        state('unchecked', style({})),
        state('completed', style({ opacity: '0' })),
        transition('unchecked =>completed', animate('100ms linear')),
        transition('* =>invalid', animate(250, keyframes([
            style({ transform: 'translateX(-15%)' }),
            style({ transform: 'translateX(15%)' }),
            style({ transform: 'translateX(-15%)' }),
            style({ transform: 'translateX(15%)' }),
        ]))),
    ])
];