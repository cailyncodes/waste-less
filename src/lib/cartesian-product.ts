export function cartesianProduct(arr1 = [], arr2 = []) {
	if (!arr1 || !arr2 || !arr1.length || !arr2.length) {
		return null;
	};
	const res = [];
	for (let i = 0; i < arr1.length; i += 1) {
		for (let j = 0; j < arr2.length; j += 1) {
			res.push([arr1[i], arr2[j]]);
		};
	};
	return res;
};