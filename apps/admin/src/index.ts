import { UI_PACKAGE } from '@mood-trip/ui';
import { z } from '@mood-trip/validators';

console.log('admin workspace ready', UI_PACKAGE, z.string().parse('ok'));
