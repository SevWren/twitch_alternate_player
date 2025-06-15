'use strict';


setInterval(
	() =>
	{
		const e = document.getElementsByClassName('claimable-bonus__icon');
		if (e.length !== 0)
		{
			e[0].click();
		}
	},
	5000
);
