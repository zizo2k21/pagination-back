import mysql from 'mysql2'

import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
    host:process.env.MYSQL_HOST,
    port:process.env.MYSQL_PORT,
    user:process.env.MYSQL_USER,
    password:process.env.MYSQL_PWD,
    database:process.env.MYSQL_DATABASE 
}).promise()


export const testFunction = (async (req, res)=>{
    
   
        // Récupération des paramètres de pagination et de tri
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const sort = req.query.sort || 'name';
        const order = req.query.order || 'ASC';
        let alias;
        switch (sort) {
            case 'title':
                alias = 'f'
                break;

            case 'name':
                alias = 'c'
                break;

            case 'rental_count':
                alias = 'rental_count'
                break;
        
            default:
                alias = 'f'
                break;
        }

        // Requête SQL pour récupérer les films paginés et triés
        const [rows, fields] = await pool.query(
            `SELECT f.title, f.rental_rate, f.rating, c.name AS category, COUNT(*) AS rental_count
             FROM film f
             JOIN film_category fc ON f.film_id = fc.film_id
             JOIN category c ON fc.category_id = c.category_id
             JOIN inventory i ON f.film_id = i.film_id
             JOIN rental r ON i.inventory_id = r.inventory_id
             GROUP BY f.film_id 
             ORDER BY ${alias === 'rental_count' ? 'rental_count' : `${alias}.${sort}`} ${order}
             LIMIT ${limit} OFFSET ${offset}`
        );

        // Requête SQL pour obtenir le nombre total de films
        const [countRows, countFields] = await pool.query(
            `SELECT COUNT(*) AS count
            FROM (
                SELECT f.film_id
                FROM film f
                JOIN film_category fc ON f.film_id = fc.film_id
                JOIN category c ON fc.category_id = c.category_id
                JOIN inventory i ON f.film_id = i.film_id
                JOIN rental r ON i.inventory_id = r.inventory_id
                GROUP BY f.film_id
            ) AS subquery;
            `
        );
        const totalCount = countRows[0].count;

        // Calcul du nombre total de pages en fonction de la limite
      
        const totalPages = Math.ceil(totalCount / limit);

        

        // Envoi de la réponse avec les résultats et les informations de pagination
        const data = {
            films: rows,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalResults: totalCount,
                limit: limit
            }
        };
        
        return data
    
})

